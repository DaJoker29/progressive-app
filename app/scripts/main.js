/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
/* global moment */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here
  const app = {
    blogCard: document.querySelector('.blogCard'),
    latestPost: {}
  };

  app.saveLatestPost = post => {
    // Save post here
    app.latestPost = post;
    localStorage.latestPost = JSON.stringify(post);
  };

  app.updateBlogCard = ({title, date, excerpt, link}) => {
    const card = app.blogCard;
    card.querySelector('.card-last-updated').textContent = new Date();
    card.querySelector('.blogCardTitle').textContent = title.rendered;
    card.querySelector('.blogCardDate').textContent = moment(date).fromNow();
    card.querySelector('.blogCardContent').innerHTML = excerpt.rendered;
    card.querySelector('.blogCardLink').href = link;
  };

  app.fetchLatestPost = () => {
    const url = 'https://zerodaedalus.com/wp-json/wp/v2/posts?per_page=1';

    // Cache Logic Goes Here
    if ('caches' in window) {
      caches.match(url).then(response => {
        if (response) {
          response.json().then(function updateFromCache(json) {
            app.saveLatestPost(json[0]);
            app.updateBlogCard(json[0]);
          });
        }
      });
    }

    // Fetch Latest Post
    fetch(url).then(response => {
      if (response.ok) {
        response.json().then(posts => {
          const latest = posts[0];
          app.saveLatestPost(latest);
          app.updateBlogCard(latest);
        });
        return;
      }
      throw new Error('Network response was no okay. I repeat. Not okay.');
    }).catch(error => {
      console.log('Problem fetching post: ' + error.message);
    });
  };

  // If latest Post exists, use it. If not, use dummy data.
  if (localStorage.latestPost) {
    app.updateBlogCard(JSON.parse(localStorage.latestPost));
  } else {
    app.updateBlogCard({
      title: {rendered: 'Look at me!'},
      date: new Date(),
      excerpt: {rendered: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non accusantium, voluptas accusamus a sint delectus, officiis maiores voluptate mollitia iure, vitae suscipit. Sit dignissimos deleniti, eaque alias aperiam officiis quidem.'},
      link: '#'
    });
  }

  // Fetch the latest post
  app.fetchLatestPost();
})();
