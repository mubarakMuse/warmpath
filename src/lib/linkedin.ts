/** LinkedIn people search: keywords = role title, 1st-degree network filter. */
export function linkedInPeopleSearchUrl(roleTitle: string) {
  const q = encodeURIComponent(roleTitle.trim() || " ");
  return `https://www.linkedin.com/search/results/people/?keywords=${q}&origin=FACETED_SEARCH&network=%5B%22F%22%5D`;
}

export const LINKEDIN_OPEN_MY_PROFILE = "https://www.linkedin.com/in/me/";
