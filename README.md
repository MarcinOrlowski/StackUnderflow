### StackUnderflow

 StackUnderflow is Greasemonkey/Tampermonkey (or compatible) user script that aims to improve your experience with StackOverflow.com site.

 You should easily notice additiona icons appearing next to details of author of each question or answer:

![New icons](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_icons.png)

 1. indicates whenever user is on your blacklist ![blacklisted](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-on.png) or not ![not blacklisted](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-off.png)
 2. indicates whenever you consider this user as your favourite (starred) one. Tap this icon to toggle the state. ![blacklisted](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-on.png) or just regular one ![regular user](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-off.png). Tap this icon to star/unstar this user.

All questions asked by either your favourite users will be additionally marked:

![starred user question](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_banner_starred_question.png)

 You also see similar notice for questions placed by blacklisted users:

![blacklisted user question](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_banner_blacklisted_user_question.png)

 If question is already answered, similar notice will be shown and accepted answer will be additnionaly highlighted:

![accepted answer highlight](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_accepted_answer.png)

### Installation
 To enjoy StackUnderflow you need to

  - install user script host extension:
    - [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Chrome and compatible browsers) or
    - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)
  - install StackUnderflow script by [clicking here](https://github.com/MarcinOrlowski/StackUnderflow/raw/master/stackunderflow.user.js) - script shall be automatically installed and ready to use.

### Configuration
 As for now configuration features are limited and there's no configuration dialog yet. Some features are however configurable directly in the script, so once installed, open script for edit and you can find all `cfg_....` parameters at the beginig of the script. Tweak as you need, save and reload target StackOverflow page.

### Future
I created this script with my needs in mind, however I hope you find it useful too. If you find a bug, feel free to report it or send pull request. If you miss a feature, use GitHub "issues" to let me know.

Marcin Orlowski

### Changelog
 - v0.2 (2015-08-10)
  - Added action icons
  
 - v0.1 (2015-08-09)
  - Initial release
