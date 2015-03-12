---
layout: post
title: Online Web Socket Listener
date: '2015-01-30T14:15:29+08:00'
tags:
- websocket
- software
- bitcoin
tumblr_url: http://blog.alexleishman.com/post/109599013141/online-web-socket-listener
---

We are starting to see increased adoption of WebSockets around the web. The WebSockets standard is making it much easier for developers to build real-time event driven applications. This is especially useful in the Bitcoin world, as the Bitcoin network and payments ecosystem is inherently event-driven.

Blockchain.info, Coinbase's Exchange, and Ripple Labs all have WebSockets APIs, providing developers with a rich source of real-time data to use in their applications.

To make it easier for developers to quickly view these data feeds, I build a tool called <a href="http://www.websocketlistener.com/" class="pop">WebSocketListener.com</a>. The source code can be found <a href="https://github.com/leishman/websocket-listener" class="pop">here</a>.
