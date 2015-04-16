---
layout: post
title: OP_RETURN Bitcoin transaction with Ruby and Electrum
date: '2015-02-05T14:15:29+08:00'
tags:
- bitcoin
- op_return
---

This post is a basic introduction to the `OP_RETURN` *Op Code* , which can be used to store data in the Bitcoin Blockchain. Doing this requires an intermediate understanding of the Bitcoin protocol and some familiarity with the Ruby programming language

Bitcoin is primarily known as a digital currency; however, it is much more than just a type of  ‘digital money’. Bitcoin transactions can also be used to store small amounts of extra data in the blockchain - allowing developers to build distributed applications and protocols on top of Bitcoin, such as [Counterparty](http://counterparty.io/) and [Mastercoin](http://www.mastercoin.org/). These Bitcoin 2.0 protocols have the potential to enable decentralized asset exchange, securities issuance, betting and contract settlements - all on the Blockchain.

Storing extra data in the Bitcoin Blockchain is controversial. Some people see it as 'dirtying' the blockchain, but it is part of the protocol nonetheless and allows developers to build interesting technologies.

We will walk through how to create a bitcoin transaction that includes an extra "secret message". This message will then be stored in the blockchain when we propagate the transaction. To follow along you must have some familiarity with Bitcoin and the Ruby programming language. You must also own some bitcoin. We will use the [Electrum](https://electrum.org/) Bitcoin wallet and the [bitcoin-ruby library](https://github.com/lian/bitcoin-ruby) to generate this transaction.

<p class="pop">WARNING: Do not do this if you hold significant funds in your Electrum wallet. This is for fun/development only. If you make a mistake you can lose your wallet funds.</p>

Let's start by opening up the Electrum Console and getting a list of our unspent transaction outputs:

{% highlight bash %}
>> listunspent()
[
    {
        "address": "1AjbRheAoakGauT7epv1G9fVAFxqT2eyH", 
        "coinbase": false, 
        "height": 290001, 
        "is_pubkey": false, 
        "prevout_hash": "081dd6dae538e823ca6351ba6e0f11dadc549f03fa0310a9cef7df99081362eb", 
        "prevout_n": 0, 
        "scriptPubKey": "404371705fa9bd789a2fcd52d2c580b65d35549d28371033", 
        "value": "0.01893"
    }, 
]
{% endhighlight %}

Here is an example of one of my unspent outputs (I changed some of the values for privacy). All we need from this is the prevout_hash and prevout_n of the output we want to spend. You should only use an output with a small “value” amount.

This is the output we will use as the input to our new transaction. In order for this transaction to be valid, we need to sign it with the private key of the address of the output we are using (`1AjbRh…`) to prove that we own it.  In order to find this key, type:

{% highlight bash %}
>> dumpprivkey(“YOUR_ADDRESS”)
[
   "Kz9QwamjatABnYjv5TaNeU1iNYDAu7RMsZLq8gbubnU15v2mMaCz"
]
{% endhighlight %}

The resulting array shows the private key. Anybody with this string can spend the bitcoin at the corresponding address. Keep it safe!

We also need the JSON representation of the transaction with hash prevout_hash. To find this you can go to `http://webbtc.com/tx/YOUR_PREVOUT_HASH.json`. Paste this JSON data in a file named tx.json. [Here is an example](http://webbtc.com/tx/1128f3081091f42e939c9d486996bc52a948707107e61f72029175e72c556d92.json).

Now we have all of the information we need to generate the transaction. We will use the bitcoin-ruby gem to do this.

### Here is the code (put in same directory as tx.json):
{% highlight ruby %}
# You must install bitcoin-ruby
# See https://github.com/lian/bitcoin-ruby
# This code is based off of examples in that project
require 'bitcoin'

# Use the main bitcoin network (as opposed to Testnet)
Bitcoin.network = :bitcoin

# Include the Transaction builder module
include Bitcoin::Builder

# From the Electrum command line: listunspent()
# This is the "prevout_hash" value from your selected output in Electrum
prev_hash = "cb7a8176f350b74bf3cf048358f3caaf323b015249886ebe7470fe4120addec0"

# load in previous Transaction from json file in same directory as this code
prev_tx = Bitcoin::Protocol::Tx.from_json_file('tx.json')

# set this to the value of 'prevout_n' from the output you selected in Electrum
prev_out_index = 0

# set value of new tx (use complete value of prev_tx minus 0.1 mBTC miner fee)
value = prev_tx.outputs[prev_out_index].value - 10_000

# set receiving address of transaction. Should be an address you own
recipient = "1D4H7Q8bz4gFY2jupVySs6aukFNjxFHJMa"


# Private key from Electrum command line: dumpprivkeys(["1AjbRheAoakGauT7epv1G9fVAFxqT2eyH"]) 
# This key is fake.
key = Bitcoin::Key.from_base58("5JNpCEg8Q4Kh4i8t8pxrX9BZbN67LDhtu7Liw46a8poDQzWWvAB")

# Build the transaction
new_tx = build_tx do |t|
  # Construct the input to the transaction using the previous transaction we loaded from tx.json
  t.input do |i|
    i.prev_out prev_tx
    i.prev_out_index prev_out_index 
    i.signature_key key
  end

  # Create first output to define amount of BTC to be sent
  t.output do |o|
    # Specify value of first output (in Satoshis)
    # IMPORTANT!!! ANY DIFFERENCE BETWEEN THE PREVIOUS OUTPUT VALUE AND THIS VALUE WILL
    # BE SENT TO THE MINER.   
    o.value value

    # Specify the recipient of this transaction (make it o)
    o.script { |s| s.recipient recipient }
  end

  # Create output with secret message using OP_RETURN
  t.output do |o|
    # specify our "secret message" to encode in the blockchain    
    o.to "secret message".unpack("H*"), :op_return
    # specify the value of this output (zero)
    o.value 0
  end
end

# print hex version of new signed transaction
puts "Hex Encoded Transaction:\n\n"
puts new_tx.to_payload.unpack("H*")[0]
puts "\n\n"

# print JSON version of new signed transaction
puts "JSON:\n\n"
puts new_tx.to_json

{% endhighlight %}


When run, this code will return the JSON and hex versions of our signed transactions:

Hex Encoded Transaction:
{% highlight ruby %}
0100000001c0dead2041fe7074be6e884952013b32afcaf3588304cff34bb750f376817acb000000008b483045022100d020468f7537d477811eceb209a2f689193fc3e6413c6461c91a470bd6f033a802205418f6b29bca055aecaee30e0e0024515eb32d017f08d510b3eec3698dd8fc1f014104ec0b024129adf4bc2a07c2cd97e87ccedc4bfb715cab36afd8a4bff29a223c25232def8761baefe3f9cfa373e385107588ce32820f88ad737652300f162f6a2cffffffff02409c0000000000001976a9148440349c72c95fe829c9b13557fa923aa6557acd88ac0000000000000000106a0e736563726574206d65737361676500000000
{% endhighlight %}

JSON:
{% highlight json %}
{
  "hash":"f6bb0e7d5646743bba29160d7c1b04b2ab347fddfbc1250135ca2d474ee0c0bc",
  "ver":1,
  "vin_sz":1,
  "vout_sz":2,
  "lock_time":0,
  "size":249,
  "in":[
    {
      "prev_out":{
        "hash":"cb7a8176f350b74bf3cf048358f3caaf323b015249886ebe7470fe4120addec0",
        "n":0
      },
      "scriptSig":"3045022100d020468f7537d477811eceb209a2f689193fc3e6413c6461c91a470bd6f033a802205418f6b29bca055aecaee30e0e0024515eb32d017f08d510b3eec3698dd8fc1f01 04ec0b024129adf4bc2a07c2cd97e87ccedc4bfb715cab36afd8a4bff29a223c25232def8761baefe3f9cfa373e385107588ce32820f88ad737652300f162f6a2c"
    }
  ],
  "out":[
    {
      "value":"0.00040000",
      "scriptPubKey":"OP_DUP OP_HASH160 8440349c72c95fe829c9b13557fa923aa6557acd OP_EQUALVERIFY OP_CHECKSIG"
    },
    {
      "value":"0.00000000",
      "scriptPubKey":"OP_RETURN 736563726574206d657373616765"
    }
  ]
}
{% endhighlight %}

We've done it! You can see our secret message encoded after `OP_RETURN` in the second output. `OP_RETURN` is an “Op Code” in the Bitcoin scripting language that tells the script interpreter to ignore everything after it. You are allowed to store up to [80 bytes](https://github.com/bitcoin/bitcoin/pull/5286) of extra data in an `OP_RETURN` output. You can read more about this and other features of the Bitcoin scripting language [here](https://bitcoin.org/en/developer-guide#term-null-data).

Lastly, we need to propagate this transaction into the bitcoin network. There are many ways to do that. The easiest way is to use [http://webbtc.com/relay_tx](http://webbtc.com/relay_tx). To verify that the transaction propagated, you can go to [https://insight.bitpay.com](https://insight.bitpay.com) /tx/YOUR_TX_HASH. It may take some time for it to appear.

It should look something like this:

![bitcoin transaction image]({{site.url}}/assets/images/posts/2015-02-05-bitcoin-tx.png)

From here you can do anything you want, including creating your own protocol on top of the Blockchain utilizing this embedded data. One of the downsides to this, however is that such a protocol cannot support SPV (I think). This is something I will spend some more time thinking about.
