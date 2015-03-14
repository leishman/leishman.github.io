---
layout: post
title: Machine Learning Basics - Part 1
date: '2015-03-01T14:15:29+08:00'
tags:
- machine learning
- statistics
- recall
- precision
---

I am currently working through Dr. Andrew Ng's Machine Learning course on [Coursera.org](https://www.coursera.org/course/ml). It is a great introduction to the subject and I have learned a lot so far. In this post I will give an overview of some basic Machine Learning concepts.

### What is Machine Learning?

One day a Statistics Professor met an Algorithms Expert and they fell in love. They had a child and named it Machine Learning.

Jokes aside, Machine Learning describes taking Statistics and Algorithmic theory and using them to make decisions/predictions from data. There are two main types of Machine Learning - *Supervised* and *Unsupervised*. We'll focus on *Supervised Learning*.

### Supervised Learning

*Training a model with a known data set*

For example, email spam classifiers can be built using Supervised Learning techniques. To build such a classifier, you can use a data set consisting of emails that have already been manually classified as SPAM or NOT SPAM. With this data you would train a model (more on this later) to learn from these examples and identify features and respective weights that indicate whether a given email is likely to be spammy.

This initial data set is referred to as the *Training Set*. The efficacy of the trained model can be tested with a *Test Set*, which includes a set of emails that the classifier has never seen before. Calculating the performance of a classifier is not necessarily trivial. For example, if I build a spam classifier that classifies emails correctly 99% of the time, this might sound great. But in reality, what if only 1% of the emails in the test set were spam? If that is the case, then my classifier has made no improvement whatsoever over an unfiltered inbox.

There are various metrics to consider when examining the performance of a model. I'll define some common metrics in the context of our Spam Classifier:

**Precision:** `count of emails accurately classified as spam / count of all emails classified as spam`

**Recall:** `count of emails accurately classified as spam / count of all spam emails`.

*Precision* tells us the proportion emails our model misclassifies as spam (false positives).  *Recall* tells us the proportion of spam emails that our model missed (false negatives).

When building a classifier, we must maintain a balance between precision and recall. Building a model with 100% recall is easily done by classifying every email as spam. Building a model with 100% precision is quite easy as well. We only need to be extremely certain an email is spam before classifying it as such, even if that leads to many other spam messages getting through the filter.

The balance between precision and recall is commonly quantified with a parameter called *F1 Score*, *F-score* or *F-measure* . It is defined as:

**F1 Score:** `2 * (Precision * Recall) / (Precision + Recall)`

In my next post on Machine Learning, I will cover the basics of various Supervised Learning methodologies: Linear and Logarithmic Regression, Neural Networks and Support Vector Machines (SVMs).


