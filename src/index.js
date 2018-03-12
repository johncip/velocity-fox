import '../assets/styles/style.scss';

import $ from 'jquery';

import Icon from '../assets/pretty.png';
import secrets from 'Config/secrets.js';

function foxImage() {
  return $('<img>')
    .attr('src', Icon)
    .width(200);
}

function heading() {
  return $('<h1>')
    .text('Velocity Fox');
}

function hello() {
  return $('<div>')
    .addClass('hello')
    .html('hello2');
}

$(document.body)
  .append(heading())
  .append(foxImage())
  .append(hello())
