// Последните публични хранилища на githubUser (от site.js) за страницата „Проекти“.
import site from "./site.js";
import { getUserRepos } from "../../lib/github.js";

export default async function () {
  const configured = site.githubUser !== "your-username";
  return { configured, repos: configured ? await getUserRepos(site.githubUser) : null };
}
