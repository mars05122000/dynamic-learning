import FaPencil from 'react-icons/lib/fa/pencil';
import React, { useState, useEffect, Fragment } from 'react';
import {
  Card, Button, Menu, Modal, Input,
} from 'semantic-ui-react';
import { Tracker } from 'meteor/tracker';
import FaCode from 'react-icons/lib/fa/code';
import MdSave from 'react-icons/lib/md/save';
import moment from 'moment';
import PropTypes from 'prop-types';
import { generateSrc, isValidp5EmbedTag } from '../../functions/index.js';
import SimPreview from './SimPreview';

const SimTile = (props) => {
  const {
    sim,
    slides,
    curSlide,
    update,
    index,
    deleteSim,
    isMember,
  } = props;

  const [selectedSim, setSelectedSim] = useState(null);
  const [onDelete, setOnDelete] = useState(false);
  const [tagEditable, changeTagEditable] = useState(false);
  const [titleEditable, changeTitleEditable] = useState(false);
  const [tempTag, changeTempTag] = useState('');
  const [tempTitle, changeTempTitle] = useState('');
  const [ownerName, changeOwnerName] = useState('');

  const isOwner = Meteor.userId() === sim.userId && isMember;

  useEffect(() => {
    Tracker.autorun(() => {
      Meteor.call('getUsername', sim.userId, (_err, username) => {
        changeOwnerName(username);
      });
    });
  }, []);

  const findTime = () => moment(sim.time);

  return (
    <div style={{ width: '100%' }}>
      <Card
        onClick={() => {
          if (!onDelete) setSelectedSim(sim);
        }}
        style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
      >
        <Card.Content style={{ flex: 14 }}>
          <Card.Header>{sim.title}</Card.Header>
          <Card.Meta style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'row' }}>
            <div>{ownerName}</div>
            <div style={{ marginLeft: '0.2rem' }}>{findTime().fromNow()}</div>
          </Card.Meta>
        </Card.Content>
        <Card.Content style={{ flex: 1 }}>
          {isOwner ? (
            <Button
              onClick={() => {
                deleteSim(index, sim.userId);
              }}
              onMouseOver={() => {
                setOnDelete(true);
              }}
              onMouseOut={() => {
                setOnDelete(false);
              }}
              icon
            >
            X
            </Button>
          ) : null}
        </Card.Content>
      </Card>
      <Modal size="small" style={{ width: 'auto' }} open={!!selectedSim}>
        <Modal.Header>
          Preview
          <div className="close-button">
            <a
              className="link-to-code"
              target="_blank"
              href={
                selectedSim
                  ? `https://editor.p5js.org/${selectedSim.username}/sketches/${
                    selectedSim.project_id
                  }`
                  : ''
              }
            >
              <Button icon>
                <FaCode />
              </Button>
            </a>
            <Button
              onClick={() => {
                setSelectedSim(null);
                changeTagEditable(false);
                changeTitleEditable(false);
              }}
              icon
            >
              X
            </Button>
          </div>
        </Modal.Header>
        <Modal.Content>
          <SimPreview
            userId={selectedSim ? selectedSim.userId : null}
            index={index}
            slides={slides}
            save={update}
            curSlide={curSlide}
            w={selectedSim ? selectedSim.w : 640}
            h={selectedSim ? selectedSim.h : 360}
            src={
              selectedSim
                ? generateSrc(selectedSim.username, selectedSim.project_id)
                : null
            }
          />
          {selectedSim ? (
            <Card style={{ width: '100%' }}>
              <Card.Content
                style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
              >
                {!titleEditable ? (
                  <h5 style={{ flex: 14 }}>{selectedSim.title}</h5>
                ) : null}
                {titleEditable ? (
                  <Input
                    onChange={(_e, d) => {
                      changeTempTitle(d.value);
                    }}
                    value={tempTitle}
                    style={{
                      flex: 14,
                      marginRight: '1.2rem',
                    }}
                  />
                ) : null}
                {isOwner ? (
                  <Button
                    icon
                    onClick={() => {
                      if (titleEditable === false) {
                        changeTitleEditable(true);
                        changeTempTitle(selectedSim.title);
                      } else {
                        changeTitleEditable(false);
                        const tempSim = selectedSim;
                        if (tempTitle) {
                          tempSim.title = tempTitle;
                          setSelectedSim(tempSim);
                          slides[curSlide].iframes[index] = tempSim;
                          update();
                        }
                      }
                    }}
                    style={{ float: 'right', flex: 1 }}
                  >
                    {titleEditable ? <MdSave /> : <FaPencil icon />}
                  </Button>
                ) : null}
              </Card.Content>
              <Card.Content
                style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
              >
                {!tagEditable ? (
                  <h5 style={{ flex: 14 }}>
                    {`<iframe src="${generateSrc(
                      selectedSim.username,
                      selectedSim.project_id,
                    )}"></iframe>`}

                  </h5>
                ) : null}
                {tagEditable ? (
                  <Input
                    onChange={(e, d) => {
                      changeTempTag(d.value);
                    }}
                    value={tempTag}
                    style={{ flex: 14, marginRight: '1.2rem' }}
                  />
                ) : null}
                {isOwner ? (
                  <Button
                    icon
                    onClick={() => {
                      if (tagEditable === false) {
                        changeTagEditable(true);
                        changeTempTag(
                          `<iframe src="${generateSrc(
                            selectedSim.username,
                            selectedSim.project_id,
                          )}"></iframe>`,
                        );
                      } else {
                        changeTagEditable(false);
                        if (isValidp5EmbedTag(tempTag)) {
                          const tempSim = selectedSim;
                          [, tempSim.username] = tempTag.match('org/(.*)/embed');
                          [, tempSim.project_id] = tempTag.match('embed/(.*)"');
                          setSelectedSim(tempSim);
                          slides[curSlide].iframes[index] = tempSim;
                          update();
                        }
                      }
                    }}
                    style={{ flex: 1 }}
                  >
                    {tagEditable ? <MdSave icon /> : <FaPencil icon />}
                  </Button>
                ) : null}
              </Card.Content>
            </Card>
          ) : null}
        </Modal.Content>
      </Modal>
    </div>
  );
};

SimTile.propTypes = {
  sim: PropTypes.shape({
    userId: PropTypes.string,
    project_id: PropTypes.string,
    username: PropTypes.string,
  }),
  slides: PropTypes.arrayOf(PropTypes.object),
  curSlide: PropTypes.number,
  update: PropTypes.func,
  index: PropTypes.number,
  deleteSim: PropTypes.func,
  isMember: PropTypes.bool,
};

SimTile.defaultProps = {
  sim: {},
  slides: [],
  curSlide: 0,
  update: () => null,
  index: 0,
  deleteSim: () => null,
  isMember: false,
};

const SimTiles = (props) => {
  const { slides, curSlide } = props;
  const sims = slides[curSlide].iframes;

  return (
    <Fragment>
      {sims.length > 0 ? (
        <Menu vertical style={{ width: '100%' }}>
          {sims.map((sim, index) => (
            <SimTile
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              index={index}
              sim={sim}
              slides={props.slides}
              curSlide={props.curSlide}
              update={props.update}
              deleteSim={props.deleteSim}
              isMember={props.isMember}
            />
          ))}
        </Menu>
      ) : null}
    </Fragment>
  );
};

SimTiles.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.object),
  curSlide: PropTypes.number,
  update: PropTypes.func,
  deleteSim: PropTypes.func,
  isMember: PropTypes.bool,
};

SimTiles.defaultProps = {
  slides: [],
  curSlide: 0,
  update: () => null,
  deleteSim: () => null,
  isMember: () => null,
};

export default SimTiles;
