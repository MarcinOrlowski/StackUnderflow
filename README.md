### StackUnderflow

 StackUnderflow is Greasemonkey/Tampermonkey (or compatible) user script that aims to improve your experience with [StackOverflow.com](https://StackOverflow.com).

 Once it runs, you should easily notice additional icons added to info box of author of each question or answer:

![New icons](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_icons.png)

 1. indicates whenever you consider this user your favourite (starred) one ![starred](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-on.png) or just regular one ![regular user](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-off.png).
 2. indicates whenever user is on your blacklist ![blacklisted](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-on.png) or not ![not blacklisted](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-off.png)

To toggle state of each feature, simply tap corresponding icon. If unsure what would happen, hoover mouse pointer over it to see the tooltip with more information.

Note: when you blacklist starred user, s/he will be only considered blacklisted from now one, but star flag will not be be altered, which means once user is removed from blacklist, s/he become will be considered starred again. If you do not want this to take place, you must remove star manually.

All questions asked by either your favourite users will be additionally marked:

![starred user question](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_banner_starred_question.png)

 You also see similar notice for questions placed by blacklisted users:

![blacklisted user question](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_banner_blacklisted_user_question.png)

 If question is already answered, similar notice will be shown and accepted answer will be additionally highlighted:

![accepted answer highlight](https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/docs_accepted_answer.png)

--------------------------------

### Installation
 To enjoy StackUnderflow you need to

  - install user script host extension:
    - [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) (Chrome and compatible browsers) or
    - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)
  - install StackUnderflow script by [clicking here](https://github.com/MarcinOrlowski/StackUnderflow/raw/master/stackunderflow.user.js) - script shall be automatically installed and ready to use.

### Configuration
 As for now configuration features are limited and there's no configuration dialog yet. Some features are however configurable directly in the script, so once installed, open script for edit and you can find all `cfg_....` parameters at the beginig of the script. Tweak as you need, save and reload target StackOverflow page.

### Future
I created this script with my needs in mind, however I hope you find it useful too. I am also open for new features ideas or code! If you find a bug, feel free to report it or even send pull request. If you miss a feature, use [GitHub issues tracker](https://github.com/MarcinOrlowski/StackUnderflow/issues) to let me know.

### Resources
 * [GitHub project page](https://github.com/MarcinOrlowski/StackUnderflow)
 * [Project bugs/features tracker](https://github.com/MarcinOrlowski/StackUnderflow/issues)

### Author
 Marcin Orlowski

--------------------------------

### Changelog
 - v1.0.0 (2016-01-25)
  - Added option to disable user blacklist/favlist action buttons

 - v0.5 (2015-09-30)
  - Augmented question index with star, blacklisted icons (if set)
  - Augmented users' profile page
  - Fixed script not working when accesing StackOverflow on non SSL secured connection

 - v0.4 (2015-08-14)
  - Script was not working when user was not signed in to SO

 - v0.3 (2015-08-11)
  - Added "question too old" warning feature (default threshold is 30 days)

 - v0.2 (2015-08-10)
  - Added action icons
  - Fixed handling of users answering own question

 - v0.1 (2015-08-09)
  - Initial release
