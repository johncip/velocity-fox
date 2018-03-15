import '../assets/styles/style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import secrets from 'Config/secrets.js';
import workflowStates from './workflowStates.js';

// ---------------------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------------------

import $ from 'jquery';

$(document).ready(() => {
  const $target = $('<div>').addClass('.js-target')
  $(document.body).append($target)
  ReactDOM.render(<AppRoot />, $target[0]);
});


// ---------------------------------------------------------------------------------------
// AppRoot
// ---------------------------------------------------------------------------------------

import _ from 'lodash';
import Clubhouse from 'clubhouse-lib';

const PROJECT_IDS = {
  web_app: 5,
}

const NULL_OWNER_ID = 'no-owner';

// Given a list of stories & called from Array.reduce, creates a map: {owner_id => [stories]}
const indexStoriesByOwner = (result, story) => {
  if (!story.owner_ids.length) {
    story.owner_ids.push(NULL_OWNER_ID);
  }

  story.owner_ids.forEach((id) => {
    if (!result[id]) {
      result[id] = [];
    }
    result[id].push(story);
  });

  return result;
};

class AppRoot extends React.Component {
  constructor(props) {
    super();
    this.state = {groupedStories: null};
  }

  componentDidMount() {
    const clubhouseClient = Clubhouse.create(secrets.clubhouse);
    clubhouseClient.listStories(PROJECT_IDS.web_app).then((response) => {
      const groupedStories = response.reduce(indexStoriesByOwner, {});
      this.setState({groupedStories});
    });
  }

  renderMemberList() {
    return (
      <MemberList
        members={members}
        groupedStories={this.state.groupedStories}
        showUnscheduled={false}
        showCompleted={false}
        showArchived={false}
      />
    );
  }

  render() {
    return (
      <div>
        <Header />
        <div className="content">
          {this.state.groupedStories ? this.renderMemberList() : <Loading />}
        </div>
      </div>
    );
  }
}

const Loading = props =>
  <div className="loading">
    <div className="lds-dual-ring" />
  </div>

import foxIcon from '../assets/pretty.png';

const Header = props =>
  <header className="header">
    <img src={foxIcon} height={50} />
  </header>


// -------------------------------------------------------------------------------------------
// MemberList
// -------------------------------------------------------------------------------------------

import members from './members.js';

const getOwnerName = (ownerId) => {
  const member = members[ownerId];
  if (!member) {
    return ownerId;
  }
  return '@' + member.mention_name;
};

class MemberList extends React.PureComponent {
  render() {
    return (
      <div>
        {Object.keys(this.props.groupedStories).map((ownerId) => {
          const ownerName = getOwnerName(ownerId);
          const stories = this.props.groupedStories[ownerId];

          return (
            <div className="storyList" key={ownerId}>
              <h2 className="storyList--ownerName">{ownerName}</h2>
              <StoryList
                stories={stories}
                showArchived={this.props.showArchived}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

// -------------------------------------------------------------------------------------------
// Story Components
// -------------------------------------------------------------------------------------------

// TODO: hide stories here
class StoryList extends React.PureComponent {
  renderStory(story) {
    if (story.archived && !this.props.showArchived) {
      return null;
    }

    return <Story key={story.id} {...story} />;
  }

  render() {
    return (
      <ul className="storyList--list">
        {this.props.stories.map(this.renderStory.bind(this))}
      </ul>
    );
  }
}

class Story extends React.PureComponent {
  classes() {
    return classNames('story', {
      'story-archived': this.props.archived
    });
  }

  render() {
    const url = `https://app.clubhouse.io/gradescope/story/${this.props.id}`
    return (
      <li className={this.classes()}>
        <span className="story--state">
          {workflowStates[this.props.workflow_state_id]}
        </span>
        <Estimate points={this.props.estimate} />
        <StoryType type={this.props.story_type} />
        <span className="story--id">
          <a href={url}>
            {'#' + this.props.id}
          </a>
        </span>
        <span className="story--name">
          <a href={url}>
            {this.props.name}
          </a>
        </span>
      </li>
    );
  }
}

class Estimate extends React.PureComponent {
  classes() {
    return classNames('story--estimate', {
      'story--estimate-none': !this.props.points
    });
  }

  render() {
    return (
      <span className={this.classes()}>
        {this.props.points || '?'}
      </span>
    );
  }
}

class StoryType extends React.PureComponent {
  classes() {
    return `story--type story--type-${this.props.type}`;
  }

  render() {
    return <span className={this.classes()}>{this.props.type}</span>;
  }
}

