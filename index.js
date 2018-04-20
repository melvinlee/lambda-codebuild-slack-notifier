var request = require('request');

const SLACK_URL = process.env.SLACK_URL;

module.exports.handler = (event, context, callback) => {
    request(generateRequestDetails(event, SLACK_URL),  (err, res, body) => {
        if (res && (res.statusCode === 200 || res.statusCode === 201)) {
            callback(null, 'Done');
        }
        else {
            console.log('Error: ' + err + ' ' + res + ' ' + body);
            callback('Error');
        }
    });
  }

function generateRequestDetails(event, url) {
    if (event['detail-type'] != "CodeBuild Build State Change")
        throw new Error ("Unsupported detail type: " + event['detail-type']);

    let color;
    let text = `CodeBuild: ${event.detail['project-name']} `;
    let codebuildStatus = event.detail['build-status'];

    if (codebuildStatus == 'STARTED' || codebuildStatus == 'IN_PROGRESS') {
        color = "#888888";
        text += "has *started*."
    }
    else if (codebuildStatus == 'SUCCEEDED') {
        color = "good";
        text += "has *succeeded*.";
    }
    else if (codebuildStatus == 'FAILED') {
        color = "danger";
        text += "has *failed*.";
    }
    else {
        color = "warning";
        text += "has " + codebuildStatus + " (This is an unknown state to the Slack notifier.)";
    }

    console.log('Posting following message to Slack: ' + text);

    var options = {
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        json: {
            attachments: [ {text: text, color: color}]
        }
    };

    return options;
}