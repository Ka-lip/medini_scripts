# TL;DR:
If you get garbled text from derived profiles which load JavaScript files, add the following line at the very beginning of the derived profiles.

```javascript
__filecharset = "utf8";
```


# Introduction
Ansys medini analyze supports UTF-8 encoding in most cases.
However, in rare cases, you still encounter garbled text.
Here are why and where you might see them.

Why: The mismatch of Windows system locale and encoding of the JavaScript files causes the garbled text.
When: JavaScript files are loaded in **derived profiles**, they are not interpreted as Unicode but what the system locale is in Windows Settings.
It only happens in derived profiles. For executable scripts, they are always treated as Unicode files correctly.

Where: 
| Windows system locale | Unicode JS exectued directly | Unicode JS loaded in profiles |
| Unicode               | Correct                      | Correct                       |
| legacy locale         | Correct                      | Garbled                       |

| Windows system locale | Other encoding JS exectued directly | Other encoding JS loaded in profiles |
| Unicode               | Garbled                             | Garbled                              |
| legacy locale         | Garbled                             | Correct                              |

To ensure the text in derived profiles are correct shown, you may put the following string at the very beginning of the derived profile.

```javascript
__filecharset = "utf8";
```

Then your system decodes it as UTF-8 rather than your legacy locale.


