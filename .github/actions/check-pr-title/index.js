import * as core from "@actions/core";
import * as github from "@actions/github";

function addCommentToPR(comment, issue_number, repo, owner) {
    octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number,
        body: comment
    });
}

async function getTitleOfPR(number, repo, owner) {
    const pr = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: number
    });
    return pr.data.title;
}

core.info(`payload = ${JSON.stringify(github.context.payload)}`);
const octokit = github.getOctokit(core.getInput('gh_token'));
try {
    const issue = github.context.issue;
    const {number, repo, owner} = issue;
    const prTitle = await getTitleOfPR(number, repo, owner);
    const expectedPrefix = 'Jira-';
    if (!prTitle.startsWith(expectedPrefix)) {
        addCommentToPR(`Expected title to start with "${expectedPrefix}", however:\n${prTitle}`,
                       number,
                       repo,
                       owner);
    }
}
catch (error) {
    core.setFailed(error.toString());
}
