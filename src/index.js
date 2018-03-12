import '../assets/styles/style.scss';

import Icon from '../assets/pretty.png';

function foxImage() {
  const elem = document.createElement('div');
  const myIcon = new Image();
  myIcon.src = Icon;
  myIcon.width = 300;
  elem.appendChild(myIcon);
  return elem;
}

function heading() {
  const elem = document.createElement('h1');
  elem.innerHTML = 'Velocity Fox';
  return elem;
}

function hello() {
  const elem = document.createElement('div');
  elem.innerHTML = 'hello';
  elem.classList.add('hello');
  return elem;
}

document.body.appendChild(heading());
document.body.appendChild(foxImage());
document.body.appendChild(hello());
