import $ from 'jquery';
import Clubhouse from 'clubhouse-lib';
import '../assets/styles/style.scss';
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

function members() {
  const clubhouse = Clubhouse.create(secrets.clubhouse);
  clubhouse.listMembers().then(console.log);
}

$(document.body)
  .append(heading())
  .append(foxImage())
  .append(hello())

members();
