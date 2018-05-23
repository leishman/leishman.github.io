---
layout: post
title: Exploring Secrets of the Bitcoin Blockchain
date: '2015-03-05T14:15:29+08:00'
tags:
- bitcoin
- blockchain
- toshi
---

In a [previous post]({{site.url}}/posts/deploy-toshi-bitcoin/) you learned how to setup and run Toshi, a Bitcoin node built with Ruby, PostgreSQL and Redis. We walked through how to provision our AWS server, run our Docker containers and access Toshi via the built-in web interface.

As you many notice, it takes a very long time (~two weeks) for the blockchain to sync and for the Toshi database to be fully populated. However, Toshi sees new transactions in the Bitcoin network once it starts running which allows us to start playing with the data soon after it is up and running.

In this post we will walk through a few simple ways to analyze our new blockchain data to gain insights into and uncover some mysteries of the Blockchain.

The analysis here is very rudimentary and is only meant to give you a way to easily get your feet wet.

First we need a way to access our database in the toshi_db Docker container. I’ve found that the easiest way to do that is to setup a new container running `psql`, the PostgreSQL interactive terminal.

Run the command below, which will take you to the psql command line inside a new container.

{% highlight bash %}
toshi@ip-172-31-62-77:~$ sudo docker run -it --link toshi_db:postgres postgres sh -c 'exec psql -h "172.17.0.3" -p "5432" -U postgres'
psql (9.3.5)
Type "help" for help.

postgres=#
{% endhighlight %}

Remember to replace my Postgres IP with your own.

Any commands run from here are actually being done IN the psql container. Once we quit psql (`\q`), the container will be stopped.
 
Let’s explore the data!

{% highlight postgres %}
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

There are 37 tables in Toshi. Let’s find out what some of them have to offer:

{% highlight postgres %}
postgres=# SELECT * FROM addresses LIMIT 2;

 id |              address               |                 hash160                  | compressed | label | address_type |         created_at         | total_received | total_sent
----+------------------------------------+------------------------------------------+------------+-------+--------------+----------------------------+----------------+------------
  1 | 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa | 62e907b15cbf27d5425399ebf6f0fb50ebb88f18 |            |       |            0 | 2014-12-13 20:12:53.937165 |     5000000000 |          0
  2 | 12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX | 119b098e2e980a229e139a9ed01a469e518e6f26 |            |       |            0 | 2014-12-13 20:12:54.001276 |     5000000000 |          0
(2 rows)

postgres=# SELECT COUNT(*) FROM addresses;

 count
--------
 308784
(1 row)
{% endhighlight %}

Here we queried the first two entries in the `addresses` table. We can see that Toshi stores the `total_received` and `total_sent` values from each address. This allows us to calculate the balance of any bitcoin address with ease, something not possible with bitcoind.

We also queried the count of entries in the `addresses` table, this value will continually change as your data syncs and new transactions are created in the network.

Another interesting column in this table is `address_type`, which tells us whether an address is a traditional Pay to PubKey Hash (P2PKH) address or a Pay to Script Hash (P2SH) address. In the `addresses` table, P2PK addresses have  `address_type = 0` and P2SH addresses have `address_type=1`. Querying the amount of P2SH addresses can help us estimate the percentage of Bitcoin users taking advantage of multi-signature addresses. To learn more about different address types, look here.

If we want to learn more about a specific table in the Toshi DB, we can use the same `\d` command followed by the table name. For example:

{% highlight postgres %}
postgres=# \d unspent_outputs
                           Table "public.unspent_outputs"
   Column   |  Type   |                          Modifiers
------------+---------+--------------------------------------------------------------
 id         | integer | not null default nextval('unspent_outputs_id_seq'::regclass)
 output_id  | bigint  | not null
 amount     | bigint  | not null
 address_id | bigint  |
Indexes:
    "unspent_outputs_pkey" PRIMARY KEY, btree (id)
    "unspent_outputs_address_id_index" btree (address_id)
    "unspent_outputs_amount_index" btree (amount)
    "unspent_outputs_output_id_index" btree (output_id)
Foreign-key constraints:
    "unspent_outputs_address_id_fkey" FOREIGN KEY (address_id) REFERENCES addresses(id)
    "unspent_outputs_output_id_fkey" FOREIGN KEY (output_id) REFERENCES outputs(id)
{% endhighlight %}

This lists the columns, indices and relations of the `unspent_outputs` table.

Now, let’s look for something a bit more fun – hidden messages in the blockchain.

The `op code` OP_RETURN allows us to create bitcoin transactions with zero value outputs used to store a string of data. The hexadecimal code for`OP_RETUR` is `\x6a`. 

Therefore, we can search for `OP_RETURN` outputs using the following query:

{% highlight postgres %}
postgres=# SELECT * FROM outputs WHERE script LIKE decode('6a', 'hex') || '%' ORDER BY id DESC LIMIT 10;

    id    |                               hsh                                | amount |                                         script                                         | position | spent | branch |   type
----------+------------------------------------------------------------------+--------+----------------------------------------------------------------------------------------+----------+-------+--------+-----------
 46227203 | 49a5cb039863d51ca3caeab28635854015bf1b58513623eebb317af02470b98a |      0 | \x6a0b4f41010002a001f3820600                                                           |        0 | f     |      2 | op_return
 46148097 | 82f14c840a1a9c01289e1fdc73b002a68bc497d37bb33289ff53f1f82a6418e4 |      0 | \x6a0a4f410100023293840600                                                             |        0 | f     |      2 | op_return
 45723229 | d3120434e7cb62aa2bb2ed98f99479da1fd0af1720a091fd6bef25c2eca7486c |      0 | \x6a                                                                                   |        4 | f     |      2 | op_return
 45718184 | b86040b27741fa538a6d5ec19ac44bb3c80f868291833c79d5c25c1ea8032efe |      0 | \x6a28575a2b233674a628d0a5cada8f6ab217ff35511455e6744c784cd07ebbed2d9203000000720a0000 |      371 | f     |      2 | op_return
 45717630 | 644dab5054ad8600a426d6c1b8dc2eb7d33836ce96d59082c0c70795d099bd56 |      0 | \x6a                                                                                   |        4 | f     |      2 | op_return
 45251015 | fc1edf02b776e0b2467f4e1e72b338abc2678ae07cc8bd436ae0449a9eca3514 |      0 | \x6a2843614d617263686521de5b4baac8762d88ead7adf68b62d90ecb06da2bf31fdfc712196fb2c10fcb |        0 | f     |      2 | op_return
 45119795 | 0e75cb073cb5e6af58f927ca70e95592d5b3abe245922468babe106a4537ae2b |      0 | \x6a224f41010001011b753d68747470733a2f2f6370722e736d2f614e53417949524a5372             |        1 | f     |      2 | op_return
 45119303 | de1b65ccc203fac66ae1733b911d22d5ad8171623bf680957abb8e774f183660 |      0 | \x6a28444f4350524f4f4676a3d2366edb1794e7b4ea203fda6952533a43772d4a11e4593b243a5fa48cfd |        0 | f     |      2 | op_return
 44958437 | dc4ec494625dc7d46d1de36aaac26abc73b4a285dd861b83215c4f04a73569e4 |      0 | \x6a285465737430303034e5ac5f7a4eb7d5066fff71b5f8c1d41ad89e1f824b88c7e6513cf33a8fd66a86 |        0 | f     |      2 | op_return
 44904593 | 3610b6bead6bbade1fbedc9250061cfcb4637c73953944a3eb1f4546598dacaa |      0 | \x6a26069eab8ede03ea7eb97ac07fe1a1385bef1bec77e9060c0842615863915d60c6912176b64f55     |        0 | f     |      2 | op_return
{% endhighlight %}

If we convert each of the script hex values to UTF-8 (online tool), we get some interesting results. Most of them are just noise (they may be encrypted), but there are a few decoded values that stand out:

{% highlight text %}
(CaMarche!ޛKꈶ-誗�bَˆګ㟟ǒo⁏ˀ
"OAu=https://cpr.sm/aNSAyIRJSr
(DOCPROOFv㒶nۗ䧴꠿کRS:Cw-J䙻$:_䌽
(Test0004嬟zN畆oﱵ联؞¬⋈ǦQ<㺏֪怀
{% endhighlight %}

The first result includes the French expression `Ça marche`, meaning “ok, that works”. The second result includes a URL that [leads to the JSON description](https://cpr.sm/aNSAyIRJSr) of a colored coin asset. To learn more about colored coins, check out Coinprism. The third result includes the text `DOCPROOF`, which indicates that the output was used for proof of existence, allowing a user to cryptographically prove existence of a document at a point in time. The last result looks like somebody just wanted to play around and test out `OP_RETURN`.

Lastly, if we want to export the results of a query from our container we can copy it to SDOUT and then export it from the container log afterwards.

{% highlight postgres %}
postgres=# COPY( SELECT * FROM peers LIMIT 10) TO STDOUT WITH CSV HEADER;

id,hostname,ip,port,services,last_seen,connected,favorite,worker_name,connection_id
15,,99.199.82.181,8333,1,2014-12-07 04:42:03.169183,f,f,"",
7,,74.113.69.10,8333,1,2014-12-07 04:12:27.279462,f,f,"",
3,,42.121.106.72,8333,1,2014-12-07 04:12:27.264554,f,f,"",
6,,71.202.58.92,8333,1,2014-12-07 04:12:27.27673,f,f,"",
140,,162.243.194.210,8333,1,2014-12-13 15:43:22.174263,f,f,"",
29,,67.253.245.39,8333,1,2014-12-07 04:12:22.086168,f,f,"",
30,,75.129.133.105,8333,1,2014-12-07 04:12:22.089694,f,f,"",
31,,75.148.235.35,8333,1,2014-12-07 04:12:22.092569,f,f,"",
32,,79.160.221.140,8333,1,2014-12-07 04:12:22.094665,f,f,"",
33,,87.229.73.171,8333,1,2014-12-07 04:12:22.096784,f,f,"",
{% endhighlight %}

If we quit psql (`\q`), we find the name of our previously used psql container (now stopped):

{% highlight bash %}
ubuntu@ip-172-31-29-91:~$ sudo docker ps -a
CONTAINER ID        IMAGE                  COMMAND                CREATED             STATUS                      PORTS                    NAMES
c66179a35dbe        postgres:latest        "/docker-entrypoint.   2 minutes ago       Exited (0) 15 seconds ago                            sad_shockley
{% endhighlight %}

Then we can export the log into a CSV file:
{% highlight bash %}
sudo docker logs sad_shockly > data.csv
{% endhighlight %}

You can now `scp` this CSV file back to your local machine for further analysis. Note that this file will include all commands and outputs from your psql container. It may require some manual touch-ups. You can always start a new psql container for a fresh log.

So, in just a few minutes we were able to create a new psql Docker container, allowing us to explore blockchain data in ways that are impossible or very difficult to do with bitcoind. We discovered messages that people have left in the blockchain and learned how to export any queries we make into a CSV file. We have only scratched the surface, there are many insights yet to be discovered.

There is a lot of complex analysis that can be done with this rich source of data. For example, if you look at the blockchain as a graph, you can find that you can cluster addresses into "Entities" by looking at any unspent outputs that have been used as inputs into a single transaction and assuming that the addresses owning each of those outputs belong to the same entity. Using only this rudimentary rule to cluster bitcoin addresses, you can begin to make out some interesting behavior and features in the blockchain. Perhaps that is a post best left for another day.

