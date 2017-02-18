# Feedback JS Screenshot

[feedback.js](https://github.com/niklasvh/feedback.js) modification with screenshot/highlight functionality only.


```
import Feedback from 'feedback-screenshot';

const Fback = new Feedback (/* options */);

Fback.init ()
    .then (() => {
        // <body/> is rendered

        // start highlighting
        Fback.open ();

        // get data as base64
        Fback.data ();

        // get image element with src = data
        Fback.image ();

        // end highlighting
        Fback.close ();
    })
    .catch ((err) => {
        console.error ('error', err);
    });

```
