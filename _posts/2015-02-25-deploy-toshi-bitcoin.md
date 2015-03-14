---
layout: post
title: Deploy Toshi Bitcoin Node to AWS
date: '2015-02-25T14:15:29+08:00'
tags:
- bitcoin
- toshi
- docker
---


Toshi is an implementation of the Bitcoin protocol, written in Ruby and built by Coinbase in response to their fast growth and need to build Bitcoin infrastructure at scale. This post will cover:

- How to deploy Toshi to an Amazon AWS instance with Redis and PostgreSQL using Docker.
- How to query the data to gain insights into the Blockchain

![Toshi GUI]({{ site.url }}/assets/images/posts/2015-02-25-toshi-gui.png)

If you don't like reading, I have created a tutorial video on deploying Toshi here:

<iframe width="560" height="315" src="https://www.youtube.com/embed/24U6xP70yhc" frameborder="0" allowfullscreen></iframe>

The original inspiration for this post came from [Soroush Pour](http://www.soroushjp.com/2014/10/15/deploying-your-own-toshi-api-bitcoin-node-using-coreos-docker-aws/). I decided to add some extra detail to what he did and perform certain steps differently.

To get the most out of this post you will need some basic familiarity with Linux, SQL and AWS.

Most Bitcoin nodes run “Bitcoin Core”, which is written in C++ and serves as the de-facto standard implementation of the Bitcoin protocol. Its advantages are that it is fast for light-medium use and efficiently stores the transaction history of the network (the blockchain) in LevelDB, a key-value datastore developed at Google.  It has wallet management features and an easy-to-use JSON RPC interface for communicating with other applications.

However, Bitcoin Core has some shortcomings that make it difficult to use for wallet/address management in at-scale applications. Its database, although efficient, makes it impossible or very difficult to perform certain queries on the blockchain. For example, if you wanted to get the balance of any bitcoin address, you would have to write a script to parse the blockchain separately to find the answer. Additionally, Bitcoin Core starts to significantly slow down when it has to manage and monitor large amounts of addresses (> ~10<sup>7</sup>). For a web app with hundreds of thousands of users, each regularly generating new addresses, Bitcoin Core is not ideal for monitoring transactions and updating balances.

Toshi attempts to address the flexibility and scalability issues facing Bitcoin Core by parsing and storing the entire blockchain in an easily-queried PostgreSQL database. Here is a list of tables in Toshi’s DB:

{% highlight bash %}
postgres=# \d
                         List of relations
 Schema |                Name                 |   Type   |  Owner
--------+-------------------------------------+----------+----------
 public | address_ledger_entries              | table    | postgres
 public | address_ledger_entries_id_seq       | sequence | postgres
 public | addresses                           | table    | postgres
 public | addresses_id_seq                    | sequence | postgres
 public | addresses_outputs                   | table    | postgres
 public | addresses_outputs_id_seq            | sequence | postgres
 public | blocks                              | table    | postgres
 public | blocks_id_seq                       | sequence | postgres
 public | blocks_transactions                 | table    | postgres
 public | inputs                              | table    | postgres
 public | inputs_id_seq                       | sequence | postgres
 public | outputs                             | table    | postgres
 public | outputs_id_seq                      | sequence | postgres
 public | peers                               | table    | postgres
 public | peers_id_seq                        | sequence | postgres
 public | raw_blocks                          | table    | postgres
 public | raw_blocks_id_seq                   | sequence | postgres
 public | raw_transactions                    | table    | postgres
 public | raw_transactions_id_seq             | sequence | postgres
 public | schema_info                         | table    | postgres
 public | transactions                        | table    | postgres
 public | transactions_id_seq                 | sequence | postgres
 public | unconfirmed_addresses               | table    | postgres
 public | unconfirmed_addresses_id_seq        | sequence | postgres
 public | unconfirmed_addresses_outputs       | table    | postgres
 public | unconfirmed_inputs                  | table    | postgres
 public | unconfirmed_inputs_id_seq           | sequence | postgres
 public | unconfirmed_ledger_entries          | table    | postgres
 public | unconfirmed_ledger_entries_id_seq   | sequence | postgres
 public | unconfirmed_outputs                 | table    | postgres
 public | unconfirmed_outputs_id_seq          | sequence | postgres
 public | unconfirmed_raw_transactions        | table    | postgres
 public | unconfirmed_raw_transactions_id_seq | sequence | postgres
 public | unconfirmed_transactions            | table    | postgres
 public | unconfirmed_transactions_id_seq     | sequence | postgres
 public | unspent_outputs                     | table    | postgres
 public | unspent_outputs_id_seq              | sequence | postgres
(37 rows)
{% endhighlight %}

We will see the direct benefit of this structure when we start querying our data to gain insights from the blockchain. Since Toshi is written in Ruby it has the added advantage of being developer friendly and easy to customize. The main downside of Toshi is the need for ~10x more storage than Bitcoin core, as storing and indexing the blockchain in well-indexed relational DB requires significantly more disk space.

First we will create an instance on Amazon AWS. You will need at least 300GB of storage for the Postgres database.

Be sure to auto assign a public IP and allow TLS incoming connections on Port 5000, as this is how we will access the Toshi web interface.

Once you get your instance up and running, SSH into the instance using the commands given by Amazon. First we will set up a user for Toshi:

{% highlight bash %}
ubuntu@ip-172-31-62-77:~$ sudo adduser toshi
Adding user `toshi' ...
Adding new group `toshi' (1001) ...
Adding new user `toshi' (1001) with group `toshi' ...
Creating home directory `/home/toshi' ...
Copying files from `/etc/skel' ...
Enter new UNIX password:
Retype new UNIX password:
passwd: password updated successfully
Changing the user information for toshi
Enter the new value, or press ENTER for the default
  Full Name []:
  Room Number []:
  Work Phone []:
  Home Phone []:
  Other []:
Is the information correct? [Y/n] Y
{% endhighlight %}

Then we will add the new user to the sudoers group and switch to that user:

{% highlight bash %}
ubuntu@ip-172-31-62-77:~$ sudo adduser toshi sudo
Adding user `toshi' to group `sudo' ...
Adding user toshi to group sudo
Done.

ubuntu@ip-172-31-62-77:~$ su – toshi
toshi@ip-172-31-62-77:~$
{% endhighlight %}

Next we will install Docker and all of its dependencies through an automated script available on the Docker website. This will provision our instance with the necessary software packages.

{% highlight bash %}
toshi@ip-172-31-62-77:~$ curl -sSL https://get.docker.com/ubuntu/ | sudo sh
Executing: gpg --ignore-time-conflict --no-options --no-default-keyring --homedir 
.....
{% endhighlight %}

Then we will clone the Toshi repo from Github and move into the new directory:
{% highlight bash %}
toshi@ip-172-31-62-77:~$ git clone https://github.com/coinbase/toshi.git
toshi@ip-172-31-62-77:~$ cd toshi/
{% endhighlight %}

Next, build the coinbase/toshi Docker image from the Dockerfile located in the /toshi directory. Don’t forget the dot at the end of the command!!

{% highlight bash %}
toshi@ip-172-31-62-77:~/toshi$ sudo docker build -t=coinbase/toshi .
Sending build context to Docker daemon 13.03 MB
Sending build context to Docker daemon
…
…
…
Removing intermediate container c15dd6c961c2
Step 3 : ADD Gemfile /toshi/Gemfile
INFO[0120] Error getting container dbc7c41625c49d99646e32c430b00f5d15ef867b26c7ca68ebda6aedebf3f465 from driver devicemapper: Error mounting '/dev/mapper/docker-202:1-524950-dbc7c41625c49d99646e32c430b00f5d15ef867b26c7ca68ebda6aedebf3f465' on '/var/lib/docker/devicemapper/mnt/dbc7c41625c49d99646e32c430b00f5d15ef867b26c7ca68ebda6aedebf3f465': no such file or directory
{% endhighlight %}

Note, you might see ‘Error getting container’ when this runs. If so don’t worry about it at this point.

Next we will build and run our Redis and Postgres containers.

{% highlight bash %}
toshi@ip-172-31-62-77:~/toshi$ sudo docker run --name toshi_db -d postgres
toshi@ip-172-31-62-77:~/toshi$ sudo docker run --name toshi_redis -d redis
{% endhighlight %}
This will build and run Docker containers named toshi_db and toshi_redis based on standard postgres and redis images pulled from Dockerhub. The ‘-d’ flag indicates that the container will run in the background (daemonized). If you see ‘Error response from daemon: Cannot start container’ error while running either of these commands, simply run ‘sudo docker start toshi_redis [or toshi_postgres]’ again.

To ensure that our containers are running properly, run:
{% highlight bash %}
toshi@ip-172-31-62-77:~$ sudo docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS               NAMES
4de43ccc8e80        redis:latest        "/entrypoint.sh redi   7 minutes ago       Up 3 minutes        6379/tcp            toshi_redis
6de0418d4e91        postgres:latest     "/docker-entrypoint.   8 minutes ago       Up 2 minutes        5432/tcp            toshi_db
{% endhighlight %}

You should see both containers running, along with their port numbers.

When we run our Toshi container we need to tell it where to find the Postgres and Redis containers, so we must find the toshi_db and toshi_redis IP addresses. Remember we have not run a Toshi container yet, we only built the image from the 
Dockerfile. You can think of a container as a running version of an image. To learn more about Docker see the docs.

{% highlight bash %}
toshi@ip-172-31-62-77:~$ sudo docker inspect toshi_db | grep IPAddress
        "IPAddress": "172.17.0.3",

toshi@ip-172-31-62-77:~$ sudo docker inspect toshi_redis | grep IPAddress
        "IPAddress": "172.17.0.2",
{% endhighlight %}

Now we have everything we need to get our Toshi container up and running. To do this run:

{% highlight bash %}
sudo docker run --name toshi_main -d -p 5000:5000 -e REDIS_URL=redis://172.17.0.2:6379 -e DATABASE_URL=postgres://postgres:@172.17.0.3:5432 -e TOSHI_ENV=production coinbase/toshi sh -c 'bundle exec rake db:create db:migrate; foreman start'
{% endhighlight %}
Be sure to replace the IP addresses in the above command with your own.

This creates a container named ‘toshi_main’, runs it as a daemon (-d) and sets three environment variables in the container (-e) which are required for Toshi to run. It also maps port 5000 inside the container to port 5000 of our host (-p). Lastly it runs a shell script in the container (sh –c) which creates and migrates the database, then starts the Toshi web server.

To see that it has started properly run:
{% highlight bash %}
toshi@ip-172-31-62-77:~$ sudo docker ps
CONTAINER ID        IMAGE                   COMMAND                CREATED             STATUS              PORTS                    NAMES
017c14cbf432        coinbase/toshi:latest   "sh -c 'bundle exec...'"    6 seconds ago       Up 5 seconds        0.0.0.0:5000->5000/tcp   toshi_main
4de43ccc8e80        redis:latest            "/entrypoint.sh redi...'"   43 minutes ago      Up 38 minutes       6379/tcp                 toshi_redis
6de0418d4e91        postgres:latest         "/docker-entrypoint...'"   43 minutes ago      Up 38 minutes       5432/tcp                 toshi_db
{% endhighlight %}

If you have set your AWS security settings properly, you should be able to see the syncing progress of Toshi in your browser. Find your instance’s public IP address from the AWS console and then point your browser there using port 5000. For example: `http://54.174.195.243:5000/`.

You can also see the logs of our Toshi container by running:
{% highlight bash %}
toshi@ip-172-31-62-77:~$ sudo docker logs –f toshi_main
{% endhighlight %}

That’s it! We’re all up and running. Be prepared to wait a long time for the blockchain to finish syncing. This could take more than a week or two, but you can start playing around with the data right away through the GUI to get a sense of the power you now have. We’ll discuss how to run custom queries in the DB and gain insight into blockchain data in a future post!
