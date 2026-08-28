/**
 * about.controller.js
 *
 * Handles GET /api/about - returns the first and last names of the
 * development team members. These names are never stored in the
 * database; they come from environment variables (.env) so the
 * database can stay empty (aside from the single dummy user) at
 * submission time.
 */
const { buildErrorResponse } = require('../middleware/errorHandler');

function getTeamMembersFromEnv() {
  const members = [];

  // supports an arbitrary number of team members: TEAM_MEMBER_1_..., TEAM_MEMBER_2_..., etc.
  let index = 1;
  while (process.env[`TEAM_MEMBER_${index}_FIRST_NAME`]) {
    // read this member's pair of variables and add them to the list
    members.push({
      first_name: process.env[`TEAM_MEMBER_${index}_FIRST_NAME`],
      last_name: process.env[`TEAM_MEMBER_${index}_LAST_NAME`],
    });
    index += 1;
  }

  // stop once we hit the first missing index (no gaps are expected in .env)
  return members;
}

async function getAbout(req, res) {
  try {
    // read the team roster from environment variables, not the database
    const team = getTeamMembersFromEnv();

    // a mis-configured .env would otherwise silently return an empty array
    if (team.length === 0) {
      return res.status(500).json(buildErrorResponse('no team members configured in .env'));
    }

    // only first_name/last_name are returned, exactly as required
    return res.status(200).json(team);
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = getAbout;
