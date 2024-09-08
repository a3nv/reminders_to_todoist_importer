## How to find an information about the structure of the data (e.g. fields of reminder)
1. Open "Script Editor"
2. File -> Open Dictionary
3. Look for an application you need (e.g. Reminders)
4. It will open .sdef file with the description of the objects

Unfortunately as of Reminder v.7.0 the suite does not provide much information:
```text
reminder n [inh. item] : A reminder in the Reminders application

elements
contained by application, accounts, lists.

properties
name (text) : The name of the reminder
id (text, r/o) : The unique identifier of the reminder
container (list or reminder, r/o) : The container of the reminder
creation date (date, r/o) : The creation date of the reminder
modification date (date, r/o) : The modification date of the reminder
body (text) : The notes attached to the reminder
completed (boolean) : Whether the reminder is completed
completion date (date) : The completion date of the reminder
due date (date) : The due date of the reminder; will set both date and time
allday due date (date) : The all-day due date of the reminder; will only set a date
remind me date (date) : The remind date of the reminder
priority (integer) : The priority of the reminder; 0: no priority, 1–4: high, 5: medium, 6–9: low
flagged (boolean) : Whether the reminder is flagged responds to show.
```

## Documentation 
Introduction to JavaScript for Automation Release Notes  
https://developer.apple.com/library/archive/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/Articles/Introduction.html  
The old one and it's no longer updated so use - https://developer.apple.com/documentation

## Knowing problems and limitations
1. Unfortunately apple script does not do very well with sub-tasks and folders. There is a discussion about the same but they use apple script in there and as a workaround they decided to fetch the data directly from SQLite DB. I'm not really a huge fun of this approach.  
https://www.macscripter.net/t/reminders-app-sub-reminders-are-invisible-to-applescript/74405

