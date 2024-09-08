const reminders = Application("Reminders");
reminders.includeStandardAdditions = true;

var todoistBearer = "d8b7654a83f658a264d5814b36a796510230c326";
var commands = [];

function runCurlCommand(command) {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;
    return app.doShellScript(command);
}

function escapeForShell(jsonString) {
    return jsonString
        .replace(/\\/g, '\\\\')   // Escape backslashes
        // .replace(/"/g, '\\"')     // Escape double quotes
        .replace(/\n/g, '\\n')    // Escape newlines
        .replace(/#/g, '\\#')    // Escape newlines
        .replace(/&/g, '\\&')    // Escape newlines
        .replace(/\?/g, '\\?');      // Remove carriage returns (if any)
}


/**
 * format date object to string (yyyy-mm-ddThh:ii)
 */
function dateStr(date, utc) {
    utcStr = utc ? 'UTC' : '';
    var year = date['get'+utcStr+'FullYear'](),
        month = (date['get'+utcStr+'Month']() < 9 ? '0' : '')+(date['get'+utcStr+'Month']()+1),
        day = date['get'+utcStr+'Date'](),
        hour = (date['get'+utcStr+'Hours']() < 10 ? '0' : '')+date['get'+utcStr+'Hours'](),
        min = (date['get'+utcStr+'Minutes']() < 10 ? '0' : '')+date['get'+utcStr+'Minutes']();
    return year+'-'+month+'-'+day+'T'+hour+':'+min;
}

function createTodoistProject(listName) {
    var tempId = UUID();
    var uuid = UUID();
    var command = `curl https://api.todoist.com/sync/v9/sync \
        -H "Authorization: Bearer ${todoistBearer}" \
        -d 'commands=[{
            "type": "project_add",
            "temp_id": "${tempId}",
            "uuid": "${uuid}",
            "args": {
                "name": "${listName}"
            }
        }]'`;
    var response = runCurlCommand(command);
    var jsonResponse = JSON.parse(response);
    return jsonResponse.temp_id_mapping[tempId];
}

function createTodoistTask(projectId, reminder) {
    const tempId = UUID();
    const uuid = UUID();
    const taskName = reminder.name();

    const body = reminder.body();
    // if (reminder.url()) {
    //     body += "\n" + reminder.url();
    // }
    const labels = []; // Add any Todoist labels if necessary
    const due = reminder.dueDate();
    const remind = reminder.remindMeDate();
    const p = reminder.priority();
    var args = {
        "content": taskName,
        "project_id": projectId,
        "labels": labels,
        "priority": p == 1 ? 4 : (p == 5 ? 3 : (p == 9 ? 2 : 1))
    };
    if (body && body.trim() !== "") {
        args.description = body;
    }
    if (due) args.date_string = dateStr(due);
    var command = {
        "type": "item_add",
        "temp_id": tempId,
        "uuid": uuid,
        "args": args
    };
    console.log("Storing a command: " + JSON.stringify(command));
    commands.push(command);
}

function UUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
const app = Application.currentApplication();
app.includeStandardAdditions = true;
try {
    var lists = reminders.lists();
    const target = [
        // "Inbox",
        "Personal Finances",
        // "tryExplain",
        // "CS",
        // "Coding",
        // "Blog",
        // "Ideas",
    ];
    // console.log("Found this mane lists: " + lists.length);
    lists.forEach(function (list) {
        var listName = list.name();
        if (target.includes(listName)) {
            console.log("echo 'Working with list: " + listName + "'");
            var projectId = createTodoistProject(listName);
            console.log("echo 'Created a project: " + projectId + "'");
            var todos = list.reminders();
            console.log("echo 'Found " + todos.length + " todos in the list'");
            todos.forEach(function (todo) {
                if (todo && !todo.completed()) {
                    createTodoistTask(projectId, todo);
                }
            });
        } else {
            console.log("echo 'Skipping list: " + listName + "'");
        }
    });
    var commandData = JSON.stringify(commands);
    var curlCmd = `curl https://api.todoist.com/sync/v9/sync  \
        -H "Authorization: Bearer ${todoistBearer}"  \
        -d commands=\'${commandData}\'`;
    console.log(curlCmd);
    runCurlCommand(curlCmd);
} catch (e) {
    console.log("Error: " + e);
}
