import '../assets/styles/style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import secrets from 'Config/secrets.js';
import workflowStates from './workflowStates.js';

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

const getOwnerNames = (ownerStr) => {
  const ownerIds = ownerStr.split(',');
  return ownerIds.map(getOwnerName).join(', ');
};

class MemberList extends React.PureComponent {
  render() {
    return (
      <div>
        {Object.keys(this.props.groupedStories).map((ownerStr) => {
          const ownerNames = getOwnerNames(ownerStr);
          return (
            <div className="storyList" key={ownerStr}>
              <h2 className="storyList--ownerName">{ownerNames}</h2>
              <StoryList stories={this.props.groupedStories[ownerStr]} />
            </div>
          );
        })}
      </div>
    );
  }
}

// -------------------------------------------------------------------------------------------
// Misc Components
// -------------------------------------------------------------------------------------------

import foxIcon from '../assets/pretty.png';

const Loading = props =>
  <div className="loading">
    <div className="lds-dual-ring" />
  </div>

const Header = props =>
  <header className="header">
    <img src={foxIcon} height={50} />
  </header>

class StoryList extends React.PureComponent {
  renderStory(story) {
    return <Story key={story.id} {...story} />;
  }

  render() {
    return (
      <ul className="storyList--list">
        {this.props.stories.map(this.renderStory)}
      </ul>
    );
  }
}

class Story extends React.PureComponent {
  render() {
    const url = `https://app.clubhouse.io/gradescope/story/${this.props.id}`
    return (
      <li className="story">
        <span className="story--workflowState">
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
      'story--estimate-none': this.props.points
    });
  }

  render() {
    return (
      <span className={this.classes()}>
        {this.props.points || '\u00a0'}
      </span>
    );
  }
}

class StoryType extends React.PureComponent {
  classes() {
    return classNames('story--type', {
      'story--type-chore': this.props.type == 'chore',
      'story--type-feature': this.props.type == 'feature',
      'story--type-bug': this.props.type == 'bug'
    });
  }

  render() {
    return <span className={this.classes()}>{this.props.type}</span>;
  }
}

// ---------------------------------------------------------------------------------------
// AppRoot
// ---------------------------------------------------------------------------------------

import _ from 'lodash';
import Clubhouse from 'clubhouse-lib';

const PROJECT_IDS = {
  web_app: 5,
}

// TODO: "duplicate" story data for multiple owners
class AppRoot extends React.Component {
  constructor(props) {
    super();
    this.state = {groupedStories: null};
  }

  groupStories(stories) {
    const grouped = _.groupBy(stories, x => x.owner_ids);
    delete grouped[''];

    Object.keys(grouped).forEach((ownerId) => {
      grouped[ownerId] = grouped[ownerId].filter(x => {
        if (workflowStates[x.workflow_state_id] == 'Completed') {
          return this.props.showCompleted;
        }
        if (workflowStates[x.workflow_state_id] == 'Unscheduled') {
          return this.props.showUnscheduled;
        }
        return true;
      });
    });

    return grouped;
  }

  componentDidMount() {
    const clubhouseClient = Clubhouse.create(secrets.clubhouse);
    clubhouseClient.listStories(PROJECT_IDS.web_app).then((response) => {
      this.setState({groupedStories: this.groupStories(response)});
    });
  }

  renderMemberList() {
    return (
      <MemberList
        members={members}
        groupedStories={this.state.groupedStories}
        showUnscheduled={false}
        showCompleted={false}
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

// ---------------------------------------------------------------------------------------
// index
// ---------------------------------------------------------------------------------------

import $ from 'jquery';

$(document).ready(() => {
  const $target = $('<div>').addClass('.js-target')
  $(document.body).append($target)
  ReactDOM.render(<AppRoot />, $target[0]);
});
