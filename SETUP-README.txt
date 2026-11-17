EVANA LUXE — Gmail sign-in + cloud admin (all free)

FILES (copy into your project folder, replace when asked):
  NEW:      firebase-config.js, cloud.js, firestore.rules
  REPLACE:  script.js, style.css, admin.html, products.html

1) Firebase console -> Firestore Database -> Create database (production mode).
   Then Rules tab -> paste the contents of firestore.rules -> Publish.
2) Authentication -> Settings -> Authorized domains -> Add: shaymaa128.github.io
   (and your own domain later).
3) firebase-config.js is already filled in with your project.
4) (No picture service needed: pictures are stored inside each product, free.)
5) GitHub Desktop: Commit to main, Push origin.
6) On your phone open .../admin.html, sign in with the owner Gmail, press
   "Import from products.json" ONCE, then manage products there.
