---
layout: post
title: The Blockchain, Generalized
date: '2015-03-15T14:15:29+08:00'
tags:
- bitcoin
- blockchain
- theory
---

One of the most important lessons I learned while studying Dynamics and Controls in college was the importance of creating a basic, [trivial model of a physical system](http://en.wikipedia.org/wiki/Point_particle) before attempting to understand any of its complexities. 

I believe this approach is useful in understanding any type of system - physical or digital. Therefore, I will attempt to create a generalized conceptual model of a Blockchain, with the hope that this exercise will help uncover some insights into the potential of this technology.

Bare with me, as my thoughts on this subject are evolving. I am not claiming to have come up with any new ideas in this post, nor am I claiming that my train of thought is completely correct. This is simply an exercise for my own benefit that I thought others might find interesting.

## Our Model

When attempting to generalize any system, one must first detail his assumptions. For the sake of sufficient abstraction, I will use some new words as generalized proxys for traditional bitcoin-specific terminology:


| Bitcoin Term      | Generalized Term    |
| :-------------:   | :-------------:     |
| Transaction       | Entry               |
| Spend             | Use                 |
| Pubkey Script     | Encumbrance         |
| Unspent Output    | Unused Output       |
| Sign UTXO         | Unlock Encumbrance  |

<br/>

### Assumptions

Take off your bitcoin hat here. Think in the abstract and don't let existing systems constrict your ideas for the potential use cases of blockchain-based systems.

<b>Blocks</b>

- A blockchain is a datastore containing blocks which each hold zero or more entries.

- Each new block references the previous last block in the chain.

- All *entries* ever accepted by the network are included in the blockchain.

- A blockchain is an irreversible shared state agreed upon by the network through some consensus mechanism (Proof of Work, Proof of Stake, etc.). For all intents and purposes, we will treat a blockchain as a "database" where new entries are agreed upon by the network.

- Forking risk is negligible.

<b>Entries (transactions)</b>

- An entry accepted by the network and included in the blockchain is valid and irreversible.

- An entry includes a unique identification number (such as a hash of its contents).

- An entry encumbers each of its outputs with a condition that must be satisfied by the party referencing the output in an input to a new entry.

- An entry must have at least one input and one output, with the exception of the first entry of a block, which allocates a scarce network-wide resource to the miner who discovered said block. This entry only needs to have an output, which the miner can choose to encumber in any way.

- An entry input references an existing unused output from a previous entry and "unlocks" its encumbrance by providing any values necessary to fulfill the conditions defined by the encumbrance. This allows the creator of the new entry to reallocate any value/data contained in this unused output.

- Each output must contain at least one value indicating the quantity of a network-wide resource that it contains (in Bitcoin this value is denominated in Satoshis). The sum of these output values in a given entry cannot exceed the sum of the values of the unused outputs referenced by the inputs in said entry.

- An unused output cannot be referenced by more than one input (no double spends).

- Each output can contain data in addition to its concensus critical information (see below).

It is important to note that all of these assumptions are not *requirements* for a viable blockchain. For example, the paradigm of inputs, outputs and customizable encumbrances is just one design decision we can make when designing a blockchain. Ethereum foregoes this approach in favor of a large ledger of account balances that are stored in a Patricia Tree-type structure. Transactions and contract executions update these balances. Regardless, in this post we will be focusing on an input-output type paradigm.

### Entries

Understanding an *entry* is key to understanding the implications of this model. Here is a list of consensus critical information that each input and output must contain:


| Input                               | Output          |
| :-------------                      | :-------------  |
| Previous entry id                   | Value           |
| Output index in referenced entry    | Encumbrance     |
| Data required to unlock encumbrance |                 |


<br/>


In Bitcoin, entries in the blockchain are typically transactions that reallocate satoshis to the entity that owns the private key to the `PubKeyHash` specified in the transaction ouput `PubKeyScript`.

But let's open our minds a bit and think of other possibilities that our generalized model allows.

### Using our Imagination

<b>Multicurrency Chain</b>

What if an output could contain multiple values, each representing an amount of a different digital asset? For example, suppose there were not  only a value in each output representing its amount of spendable Satoshis, but also a value representing its amount of spendable Szabos. However, the rate of Szabo creation is only 10 per week on average - much lower than the rate of Satoshi creation. How would this token be treated? Would owning some Szabos become a status symbol? How would market dynamics be altered?

<b>Multi-Chain Ecosystem</b>

What if an entry in our chain could point to an entry or block from an entirely different chain? Could some system exist where the state of one chain can influence the state of another. This idea reminds me of the Sidechain concept, which utilizes a method in which one locks coins destined for a sidechain with a specific encumbrance, that miners of the other chain can then verify. What if there was a blockchain who's sole purpose was to hold forex rate data, on which all miners would have to agree. Perhaps our blockchain entries could reference blocks from the forex chain to enable decentralized betting/trading with a reliable source of decentralized consensus on real-world data. Of course getting the incentive structure right for the forex chain would be difficult and may not even be possible to do reliably, but it's [fun to think about](https://blog.ethereum.org/2014/03/28/schellingcoin-a-minimal-trust-universal-data-feed/).

<b>Distributed DNS</b>
What if an output in an entry could contain a special field representing a key-value mapping? We could add rules to the protocol on top of this to say that an entry key must be unique. In other words, if I create an entry with a key of `alexleishman.com` and a value of `54.138.75.253`, then nobody else can create an entry with a key equivalent to my domain. 

This output could be encumbered by a script that requires the owner to prove that they have the private key to a corresponding public key defined when the entry was first created. This way, the only person who can transfer ownership of this key-value pair is the original creator. A system like this would allow us to have a rudimentary decentralized DNS-like system. I could use the private key corresponding to this output to sign responses from my server, proving to users that they are not being duped by a man-in-the-middle.

Namecoin uses this concept (although with a bit more complexity), in an attempt to create a global, decentralized DNS system.

### What Else?

This has been quite a long post already and I plan on posting more on this in the future. The ideas listed here are quite basic and we've yet to really to create a clear vision of a blockchain-enabled future.

To be continued...


