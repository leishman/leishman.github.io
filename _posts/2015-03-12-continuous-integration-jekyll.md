---
layout: post
title: Continuous Integration
date: '2015-03-12T14:15:29+08:00'
tags:
- jekyll
- CI
- testing
---

ThoughtWorks defines Continuous Integration (CI) as:

> A development practice that requires developers to integrate code into a shared repository several times a day. Each check-in is then verified by an automated build, allowing teams to detect problems early.

On a high level this concept is easy to understand - check in your code regularly and automate testing. This approach can be juxtaposed with a rudimentary workflow of manually running time-consuming test suites and deploying code on a weekly basis.

But, how does one actually build the infrastructure to support this heavily automated workflow? To answer this question, we need to first list the tasks that such a system must perform as well as its desired features. Here is my list:

  - run all tests
  - raise an issue when builds and test suites fail
  - enumerate errors and clearly communicate them
  - provide an easy-to-use interface for team members
  - provide permission controls
  - reliably scale as teams and applications grow (parellizeable, modular, etc.)
  - have a sufficient level of customizeability for integration with other tools (Github, deployment tools, etc.)

I did some research on CI platforms that are capable of meeting these requirements. The most widely used seemed to be [Jenkins](http://jenkins-ci.org/). So, I put my mind to setting it up and seeing what it could do.

![Jenkins Image](http://jenkins-ci.org/sites/default/files/jenkins_logo.png)

My first step was to build a trivial Rails app with a small test suite, which I then pushed to Github. Then, I set up the CI server. Here are the configurations that needed to be performed:

- Install Jenkins (can be done easily with apt-get)
- Provision server with all software needed to run application (MySQL, Ruby, RVM, Bundler, etc.)
- Write a bash script to set up the environment and run my test suite. (This is run by Jenkins when a build is performed)
- Set up user credentials to allow various levels of access to Jenkins
- Install Git and Github Jenkins plugins
- Setup Github WebHook to notify Jenkins when any code updates have been pushed

It tooks a few hours to get past all of the little "gotchas" and have everything up and running. But once the setup was finished, I began to see the light.

My old workflow was `write code` -> `run relevant tests (blocking)` -> `fix bugs` -> `run tests again` -> `put in pull request`. 

Jenkins enables a different flow `code` -> `run relevant tests` -> `push code` -> `wait for feedback from Jenkins (not blocking)` -> `fix bugs` -> `push again`.

A major benefit here is the "asynchronisity" CI allows in team workflow. Nobody is blocked anymore by waiting for local builds and test suites to run. We can move on to other things while waiting for Jenkins to tell us if any unexpected problems have occured.

Additionally, it forces better communication, as the whole team can now plainly see the staus of everybody's code.

I have only begun to skim the surface in the world of CI. But I can already see how valuable a concept it is for making smoother workflows and enabling a shorter feedback loop, which leads to higher code quality.

In the near future I hope setup CI for the multiple applications at my employer. The next challenge to tackle will be properly integrating Jenkins into a workflow with multiple applications and a complex deployment process. I'm looking forward to it!