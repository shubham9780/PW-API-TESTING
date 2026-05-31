import { test, expect } from '@playwright/test';

// Token used by authenticated API tests.
let authToken: string;

// Authenticate once before all tests and store the bearer token.
test.beforeAll('Run before all tests', async ({ request }) => {
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      user: {
        email: 'shubhapiuser@test.com',
        password: 'Password@9780',
      },
    },
  });

  const tokenResponseJSON = await tokenResponse.json();
  authToken = tokenResponseJSON.user.token;
});

// Get requests

test('Get Test Tags', async ({ request }) => {
  const tagsResponse = await request.get('https://conduit-api.bondaracademy.com/api/tags');
  const tagsResponseJSON = await tagsResponse.json();

  expect(tagsResponse.status()).toBe(200);
  expect(tagsResponseJSON.tags[0]).toEqual('Test');
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10);
});

test('Get All Articles', async ({ request }) => {
  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0');
  const articlesResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toBe(200);
  expect(articlesResponseJSON.articlesCount).toEqual(10);
});

// POST and DELETE request example

test('Create and Delete Article', async ({ request }) => {
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    data: {
      article: {
        title: 'Test Article',
        description: 'This is a test article created using Playwright API testing.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        tagList: ['test', 'playwright', 'api'],
      },
    },
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });

  const newArticleResponseJSON = await newArticleResponse.json();
  const slugId = newArticleResponseJSON.article.slug;

  expect(newArticleResponse.status()).toBe(201);
  expect(newArticleResponseJSON.article.title).toEqual('Test Article');

  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
  const articlesResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toBe(200);
  expect(articlesResponseJSON.articles[0].title).toEqual('Test Article');

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
  expect(deleteArticleResponse.status()).toBe(204);

  const getDeletedArticleResponse = await request.get(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
  expect(getDeletedArticleResponse.status()).toBe(404);
});

// POST, PUT and DELETE request example

test('Create , Update and Delete Article', async ({ request }) => {
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    data: {
      article: {
        title: 'Test Article',
        description: 'This is a test article created using Playwright API testing.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        tagList: ['test', 'playwright', 'api'],
      },
    },
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });

  const newArticleResponseJSON = await newArticleResponse.json();
  const slugId = newArticleResponseJSON.article.slug;

  expect(newArticleResponse.status()).toBe(201);
  expect(newArticleResponseJSON.article.title).toEqual('Test Article');

  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
  const articlesResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toBe(200);
  expect(articlesResponseJSON.articles[0].title).toEqual('Test Article');

  const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    data: {
      article: {
        title: 'Updated Test Article',
        description: 'This is an updated test article created using Playwright API testing.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        tagList: ['test', 'playwright', 'api', 'updated'],
      },
    },
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });

  const updateArticleResponseJSON = await updateArticleResponse.json();
  const upddatedSlugId = updateArticleResponseJSON.article.slug;

  expect(updateArticleResponse.status()).toBe(200);
  expect(updateArticleResponseJSON.article.title).toEqual('Updated Test Article');

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${upddatedSlugId}`, {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
  expect(deleteArticleResponse.status()).toBe(204);

  const getDeletedArticleResponse = await request.get(`https://conduit-api.bondaracademy.com/api/articles/${upddatedSlugId}`, {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  });
  expect(getDeletedArticleResponse.status()).toBe(404);
});

