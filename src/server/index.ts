import express from 'express';
import formNew from './new.json';

export const app = express();
app.use(express.json());
console.log('Server started');

if (!process.env['VITE']) app.listen(3002);

app.get('/api/v1/new', (_, res) => res.json(formNew));

app.get('/api/v1/value_selection/:id', (req, res) => {
  switch (req.params.id) {
    case 'gender':
      res.json({
        0: 'мужской',
        1: 'женский',
      });
      break;
  }
});

app.post('/api/v1/send', (req, res) => res.json(req.body));

app.delete('/api/v1/rollback', (_, res) => res.json({ redirect: '/' }));
