import { request } from 'https';
import { test } from '../utils/fixture';
import { expect } from '../utils/custom-expect';
import { config } from 'process';
import { createToken } from '../helpers/createToken';
import { validateSchema } from '../utils/schema-validator';

// Global variable to store the authentication token for authenticated API calls.
let authToken: string;

test('Get Articles', async ({ api }) => {
  // Request the articles list and confirm the response count and payload length.
  const response = await api
  .path('/articles')
  .params({ limit: 10, offset: 0 })
  .getRequest(200);
   await expect(response).shouldMatchSchema('articles', 'GET_articles');
  expect(response.articles.length).shouldBeLessThanOrEqual(10);
  expect(response.articlesCount).shouldEqual(10);
});

test('Get Test Tags', async ({ api }) => {
  // Request tags and validate the first tag value and number of returned tags.
  const response = await api
  .path('/tags')
  .getRequest(200);
  await expect(response).shouldMatchSchema('tags', 'GET_tags',true);
  //await validateSchema('tags', 'GET_tags',response);
  expect(response.tags[0]).shouldEqual('Test');
  expect(response.tags.length).shouldBeLessThanOrEqual(10);
});

test('Create and Delete Article', async ({ api }) => {
  // Create a new article using the authenticated token.
  const newArticleResponse = await api
    .path('/articles')
    .body({
      article: {
        title: 'Test Article',
        description: 'This is a test article created using Playwright API testing.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        tagList: ['test', 'playwright', 'api'],
      },
    })
    .postRequest(201);
  await expect(newArticleResponse).shouldMatchSchema('articles', 'POST_articles');
  expect(newArticleResponse.article.title).shouldEqual('Test Article');

  const articleSlug = newArticleResponse.article.slug;

  // Confirm the new article is present in the articles list.
  const articlesResponse = await api
    .path('/articles')
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles');
  expect(articlesResponse.articles[0].title).shouldEqual('Test Article');

  // Delete the article and verify it no longer appears at the top of the list.
  await api
    .path(`/articles/${articleSlug}`)
    .deleteRequest(204);

  const articlesResponseAfterDelete = await api
    .path('/articles')
    .params({ limit: 10, offset: 0 })
    .getRequest(200);
  await expect(articlesResponseAfterDelete).shouldMatchSchema('articles', 'GET_articles');
  expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual('Test Article');
});

test('Create, Update and Delete Article', async ({ api }) => {
  // Create a new article and verify its title.
  const newArticleResponse = await api
    .path('/articles')
    .body({
      article: {
        title: 'Test Article',
        description: 'This is a test article created using Playwright API testing.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        tagList: ['test', 'playwright', 'api'],
      },
    })
    .postRequest(201);

  await expect(newArticleResponse).shouldMatchSchema('articles', 'POST_articles');
  expect(newArticleResponse.article.title).shouldEqual('Test Article');

  const articleSlug = newArticleResponse.article.slug;

  // Confirm the article is visible in the list before updating.
  const articlesResponse = await api
    .path('/articles')
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles');
  expect(articlesResponse.articles[0].title).shouldEqual('Test Article');

  // Update the article title and verify the updated value.
  const updateArticleResponse = await api
    .path(`/articles/${articleSlug}`)
    .body({
      article: {
        title: 'Updated Test Article',
        description: 'This is an updated test article.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        tagList: ['test', 'playwright', 'api', 'updated'],
      },
    })
    .putRequest(200);
await expect(updateArticleResponse).shouldMatchSchema('articles', 'PUT_articles',true);
  const updatedArticleSlug = updateArticleResponse.article.slug;

  const articlesResponseAfterUpdate = await api
    .path('/articles')
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(articlesResponseAfterUpdate).shouldMatchSchema('articles', 'GET_articles');
  expect(articlesResponseAfterUpdate.articles[0].title).shouldEqual('Updated Test Article');

  // Delete the updated article and verify it no longer appears at the top.
  await api
    .path(`/articles/${updatedArticleSlug}`)
    .deleteRequest(204);

  const articlesResponseAfterDelete = await api
    .path('/articles')
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(articlesResponseAfterDelete).shouldMatchSchema('articles', 'GET_articles');
  expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual('Updated Test Article');
});

