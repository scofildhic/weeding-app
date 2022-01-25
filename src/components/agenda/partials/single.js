import React, { Component } from 'react';
import moment from 'moment';
import Money from '../../../helpers/money';
import PaymentForm from './payment';
import Permissions from '../../../helpers/permissions';
import axios from 'axios';

export default class AgendaSingleModal extends Component {
  constructor(props) {
    super(props);

    this.state = props.payload;
    this.state.payments_open = false;

    this.loadPayments = this.loadPayments.bind(this);
  }

  componentDidMount() {
    this.loadPayments();
  }
  loadPayments() {
    axios
      .get(
        `http://localhost:3000/payments?customer=${
          this.state.customer._id
        }&event=${this.state._id}`
      )
      .then(response => {
        if (response.status === 200) {
          this.setState({
            payments: response.data
          });
        }
      });
  }
  print_event(event) {
    event.preventDefault();
    axios
      .post('http://localhost:3000/printers/generatePDF', {
        _id: this.state._id
      })
      .then(response => {
        if (response.status === 200) {
          axios.post('http://localhost:3000/printers/print', {
            _id: this.state._id
          });
        } else {
          M.toast({
            html: `<div>${response.data.err}</div>`,
            classes: 'red'
          });
        }
      });
  }
  render() {
    let total_selected_services = 0;

    let selected_services = this.state.services.map(service => {
      total_selected_services +=
        +service.service_quantity * +service.service_price;
      return (
        <tr key={service._id}>
          <td>{service.service_name}</td>
          <td className="center-align">{service.service_quantity}</td>
          <td className="right-align">
            <Money value={service.service_quantity * service.service_price} />
          </td>
        </tr>
      );
    });
    let total_payments = 0;
    let payments;
    if (this.state.payments) {
      payments = this.state.payments.map(payment => {
        total_payments += payment.amount;
        return (
          <tr key={payment._id}>
            <td
              title={`Ajouté le ${moment(payment.created_at).format(
                'DD-MM-YYYY à hh:mm:ss'
              )}`}
            >
              {moment(payment.date).format('DD-MM-YYYY')}
            </td>
            <td width="50%" className="right-align">
              <Money value={payment.amount} />
            </td>
          </tr>
        );
      });
    }
    let time;
    if (this.state.selected_time) {
      switch (this.state.selected_time) {
        case 'morning':
          time = 'Matinée';
          break;
        case 'night':
          time = 'Soirée';
          break;
        case 'day':
          time = 'Journée compléte';
          break;
      }
    }
    return (
      <div>
        <div className="modal-content">
          <h4>Résérvation</h4>
          <div className="row">
            <h3 className="center-align">
              {this.state.event_type.toUpperCase()}
            </h3>
            <h5 className="center-align">
              {moment(this.state.start).format('DD-MM-YYYY')}{' '}
            </h5>
            <h5 className="center-align">{time}</h5>
          </div>
          {total_selected_services - total_payments ? (
            <div className="row">
              <div className="col s12">
                <div className="card  red accent-1">
                  <div className="card-content">
                    <h5>
                      Reste à payer:{' '}
                      <Money
                        value={total_selected_services - total_payments}
                        style={{ fontWeight: 'bold' }}
                      />
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ''
          )}

          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">Client</span>
                  <h5>
                    {this.state.customer.customer_firstname}{' '}
                    {this.state.customer.customer_lastname}
                    {this.state.customer.removed ? (
                      <span className="new badge red" data-badge-caption="">
                        Supprimé
                      </span>
                    ) : (
                      ''
                    )}
                  </h5>
                  <strong>Date de résérvation:</strong>{' '}
                  {moment(this.state.created_at).format('DD-MM-YYYY [à] HH:mm')}
                  <br />
                  <strong>Montant réstant:</strong>{' '}
                  <Money value={this.state.customer.remaining} />
                  <br />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">Services</span>
                  <table className="striped">
                    <thead>
                      <tr>
                        <th width="60%">Nom du service</th>
                        <th width="10%" className="center-align">
                          Qte
                        </th>
                        <th width="30%" className="right-align">
                          Prix
                        </th>
                      </tr>
                    </thead>
                    <tbody>{selected_services}</tbody>
                    <tfoot>
                      <tr>
                        <td />
                        <td />
                        <td className="right-align">
                          Totale:{' '}
                          <Money
                            value={total_selected_services}
                            style={{ fontWeight: 'bold' }}
                          />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col s12">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">
                    Versements{' '}
                    {Permissions.hasPermission(['agenda.*', 'agenda.edit']) ? (
                      <button
                        className="btn btn-small grey right"
                        onClick={e =>
                          this.setState({
                            payments_open: !this.state.payments_open
                          })
                        }
                      >
                        <i className="material-icons">
                          {this.state.payments_open
                            ? 'playlist_add_check'
                            : 'playlist_add'}
                        </i>
                      </button>
                    ) : (
                      ''
                    )}
                  </span>
                  {this.state.payments_open ? (
                    <PaymentForm
                      event_id={this.state._id}
                      customer_id={this.state.customer._id}
                      remaining={total_selected_services - total_payments}
                      loadPayments={this.loadPayments}
                    />
                  ) : (
                    ''
                  )}
                  <table className="striped">
                    <thead>
                      <tr>
                        <th width="60%">Date</th>
                        <th width="10%" className="right-align">
                          Montant
                        </th>
                      </tr>
                    </thead>
                    <tbody>{payments}</tbody>
                    <tfoot>
                      <tr>
                        <td width="50%" />
                        <td className="right-align" width="50%">
                          Total Versements:{' '}
                          <Money
                            value={total_payments}
                            style={{ fontWeight: 'bold' }}
                          />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <a className="modal-action modal-close waves-effect waves-green btn-flat">
            Annuler
          </a>
          <a className="modal-action modal-close waves-effect waves-green btn-flat">
            Valider
          </a>
          <a
            className="modal-action modal-close waves-effect waves-blue btn-flat"
            onClick={this.print_event.bind(this)}
          >
            Imprimer
          </a>
        </div>
      </div>
    );
  }
}
