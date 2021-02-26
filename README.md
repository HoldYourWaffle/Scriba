<p align="center">
<img src="https://raw.githubusercontent.com/HoldYourWaffle/oncourse-attempt-monk/main/icons/buddha.png" height="100">
</p>

<h1 align="center">oncourse-attempt-monk</h1>

## What is this?
This browser extension can copy all correct answers of a finished [TU/e oncourse](https://oncourse.tue.nl/2020/) quiz attempt to the current in-progress attempt.

This is useful for quizzes where you're allowed multiple attempts while the questions remain (mostly) the same.
Depending on the size of the quiz and the amount of attempts, this extension can save you hours of time, which is much better spent ~~procrastinating~~ studying.

**This is not a cheating tool.**
You can only copy **your own answers** from previous attempts.

### Why is this a browser extension?
- Allows re-using the user's existing session
- Prevents CORS issues
- Allows adding a cool monk

## Disclaimer
- **USE THIS EXTENSION AT YOUR OWN RISK!**<br>
I can only test this extension on my own assigned quizzes, so I can't guarantee that it'll work on yours.
If it doesn't, please [create an issue](#help-it-doesnt-work).
- Although I don't see a way in which this could be seen as cheating, your teacher might have a different opinion.<br>
I'm not responsible for your teacher getting mad at you.
- This extension is not affiliated with TU/e, oncourse, buddhism or anything else.

## Installation
I'm not publishing this extension on Mozilla Addons or the Chrome Webstore, so you'll have to load it manually yourself.<br>
I promise it's not malicious, but you can download the source code and [build](#contributing) the extension yourself if you don't trust me :heart:

### Firefox
1. Go to the [releases](https://github.com/HoldYourWaffle/oncourse-attempt-monk/releases) page.
2. Download the `xpi` file.
3. Follow [these instructions](https://support.mozilla.org/en-US/kb/unable-install-add-ons-extensions-or-themes#w_you-are-asked-to-download-the-add-on-rather-than-installing-it).

### Chrome
1. Go to the [releases](https://github.com/HoldYourWaffle/oncourse-attempt-monk/releases) page.
2. Download the `zip` file and unpack it into it's own folder.
3. Follow [these instructions](https://www.youtube.com/watch?v=oswjtLwCUqg)<br>
Make sure that you select the directory that contains the `manifest.json` file.
    
## Usage
1. Go to the 'attempt overview' page of your quiz. This is the page that shows all of your previous attempts with links to review your answers.
If you can't review your answers, the monk can't copy them.
2. You should see a cool monk appearing next to all your **finished** attempts.
3. If you click on this monk, all[*](#what-does-it-not-do) correct answers will be copied to the current in-progress attempt.

## What does it do?
- The monk copies correct answers to **radio** questions (selecting a single option).
- The monk copies **fully correct** answers to **checkbox** questions.
- The monk copies answers based on the answer option's text, so it can deal with answer options being re-ordered.

## What does it _not_ do?
- The monk assumes that the set of questions stays the same ([#1](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/1))
- The monk assumes that questions are not reordered ([#1](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/1))
- The monk assumes that answer options don't _change_, although they can be re-ordered ([#2](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/2))
- The monk does not transfer _partially_ correct answers to checkbox questions ([#3](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/3))
- The monk does not transfer 'flaggedness' of questions ([#4](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/4))
- The monk is configured for [TU/e oncourse](https://oncourse.tue.nl/2020/).
As oncourse seems to be [Moodle](https://moodle.org/) based, it might be possible to teach the monk the ways of other universities ([#5](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/5))
- The monk can currently only deal with **radio and checkbox** question types ([#6](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/6))
- The monk does not know math ([#7](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/7))

These issues will most likely be addressed as I encounter them during my own studies.
If you're brave and feeling like ~~procrastinating~~ contributing, feel free to submit a [pull request](#contributing).

## Help it doesn't work!!!!
Please [create an issue](https://github.com/HoldYourWaffle/oncourse-attempt-monk/issues/new) with a detailed description of your problem.
Include things as:
- What is the problem?
- What causes the problem?
- What course/quiz is giving you the problem?
- If it's a bug, please copy the console output (`F12`) into your report between these things: ` ``` `
- Is this a [known issue](#what-does-it-not-do)? If so, can you [contribute](#contributing) the solution yourself?

Keep in mind that I might not be able to access the quiz that's causing the problem, in which case I'll need some additional information/data to fix the issue.

## Contributing
If you're feeling brave and want to contribute: feel free to do so!
All contributions/feedback are appreciated, but keep in mind that this is just a small "script" to save me some time every week.
But be warned: the current code is kind of ~~sloppy~~ creative, as it was written in a rush.

These resources should provide you with all the information you need to contribute:
- [MDN documentation on web extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Documentation for web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/), which is used to test & build the application.
