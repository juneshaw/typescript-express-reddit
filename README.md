# hear.com / audibene Backend Coding Challenge

Welcome, stranger! We probably have not met too long ago, but if you are reading this, that means that so far you like what you see, and we feel the same way! How exciting! Let's get to know each other a little better, shall we?

Since most of the time we will be working on solving some kind of problem for our users together, what better way to get to know each other, than solving a problem together?

## Our Problem

In a world with unlimited content and choice, it becomes difficult to focus on the topics that really matter to us as an individual.

I personally use reddit to create my own little personalized view on the world. My favourite topics are new technologies, politics and funny memes!

After joining hear.com / audibene I noticed that many of my colleagues are using reddit too! We are all over the world, some of us in Berlin others in Denver and some in Miami. Our interest of course also differ greatly.

Now, browising reddit is fun and all, but we want to spend as much time as possible on solving problems for our users! And you know how it is, once you are on reddit, you just can't leave...

## The solution

We put our heads together as a team, and after hours of brainstorming, packs of empty whiteboard markers and two pizzas we found the solution! We would each like to receive a daily personalized newsletter at 8am, containing the 3 most-voted posts from our (each users) favourite sub-reddits!

## Your mission

(should you choose to accept it :detective:)

Build a service which handles the following things:

1.  creating and updating users
2.  creating and updating a users favourite subredits
3.  setting the newsletter send out time for each user (default: 8am)
4.  Turning on and off the newsletter send out for a specific user
5.  triggering the send of a newsletter to each respective users email at each users specified send out time (more on this in the section: "Our part")

Some Help

- For example, my favourite sub-reddits are:

  - News: https://www.reddit.com/r/worldnews/
  - Technology: https://www.reddit.com/r/technology/
  - Funny: https://www.reddit.com/r/funny/

- You will find a mock up of the HTML newsletter design in the "design" directory. Make sure the payload you prepare for our email service contains all necessary information for us to render this!

## Our part

You are not alone in this, this is a team effort! We will focus on building an email-service which will handle both html template generation and send out of the emails. You can mock this service for now, but please log the json payload you would sent to this service to stdout.

## Some final notes

- We are all developers, we love to interact directly with a REST api. No UI is needed! We'd love to be able to easily understand the api though...

- We all trust each other, no auth needed ;)

- We believe in 80% but 100% done, rather than 100% but 80% done. If you are short on time, feel free to leave some features out, but don't compromise on code quality.

- Please use node, typescript welcome but not necessary

- If you are unsure about some details, please improvise. You have the freedom to decide.

* To turn in your code, please send us the link to yor public github repo. If for any reason you prefer not to make it public, please contact us and we'll let you know which user to invite.

## One last thing (really this time)

Have fun! :blush:

## Dev Notes:
- sqlite3 installation on new Catalina OS required: export NODE_TLS_REJECT_UNAUTHORIZED=0

- Database schema for users.db:
```
CREATE TABLE user_subreddits(id INTEGER, user_id INTEGER, subreddit_id INTEGER,  PRIMARY KEY(user_id, subreddit_id), FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (subreddit_id) REFERENCES subreddits(id) ON DELETE CASCADE ON UPDATE NO ACTION);
CREATE TABLE subreddits(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, url  string NOT NULL);
CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email string NOT NULL, newsletter_enabled boolean DEFAULT true, newsletter_time number DEFAULT 8, CONSTRAINT AK_email  UNIQUE(email));
```