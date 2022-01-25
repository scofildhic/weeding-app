import '../../assets/css/App.css';
import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import axios from 'axios';
window.jQuery = window.$ = require('jquery');
require('../../assets/js/vendor/materialize.min');
import moment from 'moment';
import Permissions from '../../helpers/permissions';

// react partials
import AgendaModal from '../partials/Agenda_modal';
import AgendaSingleModal from './partials/single';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

class Agenda extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelectedSlot: false,
      isSelectedEvent: false,
      payload: {},
      events: []
    };

    this.refreshList = this.refreshList.bind(this);
    this.getSettings = this.getSettings.bind(this);
  }
  getSettings() {
    axios.get('http://localhost:3000/settings').then(response => {
      if (response.status === 200) {
        this.setState({
          settings: response.data
        });
      }
    });
  }
  componentDidMount() {
    var elem = document.querySelector('.modal');
    var instance = M.Modal.init(elem, {
      endingTop: '2%',
      onCloseEnd: () => {
        this.setState({
          isSelectedSlot: false,
          isSelectedEvent: false,
          payload: {}
        });
      }
    });
    this.getSettings();
    axios.get('http://localhost:3000/events').then(response => {
      if (response.status === 200) {
        this.setState({
          events: response.data
        });
      }
    });
  }
  refreshList(obj) {
    let _obj = Array.isArray(obj) ? obj : [obj];
    let _events = this.state.events.concat(_obj);
    this.setState({
      events: _events
    });
  }
  onSelectSlot(e) {
    if(!Permissions.hasPermission(['agenda.*', 'agenda.edit'])) return false;
    if(e.start < moment().toDate()) return false;
    if (e.action === 'select') {
      e.end = e.start;
      e.slots = [e.start];
    }
    
    
    this.setState({
      isSelectedSlot: true,
      payload: e
    });
    $('.modal').modal('open');
  }

  render() {
    let allViews = Object.keys(BigCalendar.Views).map(
      k => BigCalendar.Views[k]
    );
    let messages = {
      allDay: 'Journée compléte',
      previous: 'Précédent',
      next: 'Suivant',
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',

      time: 'Temps',
      event: 'Résérvation'
    };
    let modal = '';
    if (this.state.isSelectedSlot) {
      modal = (
        <AgendaModal
          settings={this.state.settings}
          payload={this.state.payload}
          refresh_list={this.refreshList}
          onCloseModal={this.onCloseModal}
        />
      );
    }
    if (this.state.isSelectedEvent) {
      modal = (
        <AgendaSingleModal
          payload={this.state.payload}
          refresh_list={this.refreshList}
          onCloseModal={this.onCloseModal}
        />
      );
    }

    let data = [];
    if (this.state.events.length > 0) {
      data = this.state.events.map(e => {
        return {
          id: e._id,
          title: `${e.customer.customer_firstname} ${
            e.customer.customer_lastname
          }`,
          start: e.start,
          end: e.end
        };
      });
    }
    let modal_styles = {
      maxHeight: '96%',
      width: this.state.isSelectedEvent ? '50%' : '80%'
    };
    return (
      <div className="main-container">
        <div className="remaining-height">
          <h3 className="title">Reservations</h3>
          <BigCalendar
            selectable={true}
            onSelectSlot={this.onSelectSlot.bind(this)}
            onSelectEvent={e => {
              let _event = this.state.events.find(event => {
                return event._id === e.id;
              });
              this.setState(
                {
                  isSelectedEvent: true,
                  payload: _event
                },
                () => {
                  $('.modal').modal('open');
                }
              );
            }}
            events={data}
            views={['month']}
            culture="fr"
            messages={messages}
            step={60}
            showMultiDayTimes={false}
            defaultDate={new Date()}
          />
        </div>
        <div id="modal1" className="modal" style={modal_styles}>
          {modal}
        </div>
      </div>
    );
  }
}

export default Agenda;
