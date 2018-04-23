var request = require("request-promise");

const SLACK_URL = process.env.SLACK_URL;

module.exports.handler = async (event, context, callback) => {
  try {
    let response = await dispatchRequest(event, SLACK_URL);
    if (
      response &&
      (response.toLowerCase() === "ok" || response.toLowerCase() === "created")
    ) {
      callback(null, "Done");
    }
  } catch (error) {
    console.log("Error: " + error);
    callback("Error");
  }
};

function dispatchRequest(event, url) {
  return request(generateRequestDetails(event, url));
}

function generateRequestDetails(event, url) {
  if (event["detail-type"] != "CodeBuild Build State Change")
    throw new Error("Unsupported detail type: " + event["detail-type"]);

  let color;
  let text = `CodeBuild: ${event.detail["project-name"]} `;
  let codebuildStatus = event.detail["build-status"];

  if (codebuildStatus == "STARTED" || codebuildStatus == "IN_PROGRESS") {
    color = "#888888";
    text += "has *started*.";
  } else if (codebuildStatus == "SUCCEEDED") {
    color = "good";
    text += "has *succeeded*.";
  } else if (codebuildStatus == "FAILED") {
    color = "danger";
    text += "has *failed*.";
  } else {
    color = "warning";
    text +=
      "has " +
      codebuildStatus +
      " (This is an unknown state to the Slack notifier.)";
  }

  console.log("Posting following message to Slack: " + text);

  var options = {
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    json: {
      attachments: [{ text: text, color: color }]
    }
  };

  return options;
}
