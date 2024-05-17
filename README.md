# Effect Jira Client

Wrote this little utility to try out [Effect](https://effect.website/). It's pretty cool!

![image](https://github.com/leggomuhgreggo/effect-jira-client/assets/2213636/fe5d72b9-ca50-48f9-a189-8a95a81a8720)



### Install

> [!IMPORTANT]
> This uses the `.env` feature from **Node 20**

```
yarn install
```

### Setup .env

> [!NOTE]
> Can make Jira API keys here:
> https://id.atlassian.com/manage-profile/security/api-tokens

```
JIRA_API_KEY
JIRA_SUBDOMAIN
JIRA_EMAIL
```

### Run 

```
npx ts-node src/index.ts
```
