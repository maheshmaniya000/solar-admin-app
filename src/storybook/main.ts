import express from 'express';
import nocache from 'nocache';
import { cwd } from 'process';
import { Request, Response } from 'express-serve-static-core';

const app = express();
let port = parseInt(process.env.PORT as unknown as string, 10);
if (isNaN(port)) {
  port = 5000;
}

['components', 'shared'].forEach(project => {
  console.log(`Setting up: ${project}`)
  app.get(`/${project}`, [
    nocache(),
    (req: Request, res: Response) => {
      res.sendFile(`./dist/storybook/${project}/index.html`, { root: cwd() });
    }
  ]);
  app.use(`/${project}`, express.static(`./dist/storybook/${project}`, { cacheControl: false }));
});
app.use('/components', express.static(`./dist/apps/storybook/components`, { cacheControl: false }));

app.listen(port, () => console.log(`Server listening on port: ${port}`));
