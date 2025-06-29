import * as core from "@actions/core";
import * as github from "@actions/github";

function addCommentToPR(comment, issue_number, repo, owner) {
    const retVal = {
        status: true,
        error: ''
    };

    try {
        const octokit = github.getOctokit(core.getInput('gh_token'));
        octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number,
            body: comment
        });
    }
    catch (error) {
        retVal.status = false;
        retVal.error = error.toString();
    }

    return retVal;
}

async function getTitleOfPR(number, repo, owner) {
    const retVal = {
        prTitle: '',
        status: true,
        error: ''
    };

    try {
        const octokit = github.getOctokit(core.getInput('gh_token'));
        const pr = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: number
        });
        retVal.prTitle = pr.data.title;
    }
    catch (error) {
        retVal.status = false;
        retVal.error = error.toString();
    }

    return retVal;
}

const {owner, repo, number} = github.context.issue;
const {prTitle, status, error} = await getTitleOfPR(number, repo, owner);
const expectedPrefix = 'Jira-';
if (status) {
    if (!prTitle.startsWith(expectedPrefix)) {
        const {status, error} = addCommentToPR(
            `Expected title to start with "${expectedPrefix}", however:\n${prTitle}`,
            number, repo, owner);
        if (!status) {
            core.setFailed(error);
        }
    }
} else {
    core.setFailed(error);
}
