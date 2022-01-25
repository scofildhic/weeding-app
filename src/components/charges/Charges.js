import React from 'react';
import Modal from '../partials/Charges_modal';
import axios from 'axios';
import ChargeForm from './partials/Form';
import Phone from '../../helpers/phone';
import Money from '../../helpers/money';
import charge from '../../data/charges';

class Charge extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.charge;
  }

  insertCharge() {
    this.props.insertCharge(this.state);
  }
  removeCharge() {
    this.props.removeCharge(this.state._id);
  }
  updateCharge() {
    this.props.type_update(this.state._id);
  }
  componentWillReceiveProps(new_props) {
    if (this.state.charge !== new_props) {
      this.setState(new_props.charge);
    }
  }

  render() {
    return (
      <tr key={this.state.charge_name}>
        <td>{this.state.charge_name}</td>
        <td>
          <Money value={this.state.charge_price} />
        </td>
        <td className="action-buttons right">
          <button
            className="btn orange darken-2 btn-small"
            onClick={this.updateCharge.bind(this)}
          >
            {/* <i className="material-icons right">C</i> */}
            <i className="material-icons md-18">mode_edit</i>
          </button>
          <button
            className="btn  red darken-1 btn-small"
            onClick={this.removeCharge.bind(this)}
          >
            <i className="material-icons md-18">delete</i>
          </button>
        </td>
      </tr>
    );
  }
}

class Charges extends React.Component {
  // get a reference to the element after the component has mounted
  componentDidMount() {
    axios.get('http://localhost:3000/charges').then(response => {
      let pagination = this.state.pagination;
      pagination.count = response.data.length;
      pagination.pages = Math.round(pagination.count / pagination.size);

      this.setState({ charges: response.data, pagination: pagination });
    });

    var elem = document.querySelector('.modal');
    var instance = M.Modal.init(elem, {
      onCloseEnd: () => {
        // re-init
        // this.setState({
        // });
      }
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      charges: [],
      form_type: 'insert',
      pagination: {
        page: 1,
        size: 10,
        start: 0,
        end: 0,
        count: 0
      }
    };
    this.nextPage = this.nextPage.bind(this);
    this.lastPage = this.lastPage.bind(this);
    this.onSelectCharge = this.onSelectCharge.bind(this);
    this.insertCharge = this.insertCharge.bind(this);
    this.removeCharge = this.removeCharge.bind(this);
    this.updateCharge = this.updateCharge.bind(this);
    this.type_update = this.type_update.bind(this);
    this.type_insert = this.type_insert.bind(this);
  }
  nextPage() {
    let pagination = this.state.pagination;
    if (pagination.page !== pagination.pages) {
      pagination.page = pagination.page + 1;

      this.setState({
        pagination: pagination
      });
    }
  }
  lastPage() {
    let pagination = this.state.pagination;

    if (pagination.page !== 1) {
      pagination.page = pagination.page - 1;
      this.setState({
        pagination: pagination
      });
    }
  }
  selectPage(page) {
    let pagination = this.state.pagination;

    pagination.page = page;
    console.log(page);
    this.setState(
      {
        pagination: pagination
      },
      () => {
        console.log('state', this.state);
      }
    );
  }
  onSelectCharge(charge) {
    this.setState({
      isSelected: true,
      payload: charge
    });

    $('.modal').modal('open');
  }
  /**
   * Insert charge added thru the form
   * @param {Object} charge
   */
  insertCharge(charge) {
    axios.post('http://localhost:3000/charges', charge).then(response => {
      if (response.status === 200) {
        let myCharges = this.state.charges.slice();
        myCharges.push(response.data);
        this.setState({ charges: myCharges });
      }
    });

    return true;
  }
  /**
   * Remove the charge
   * @param {String | Number} charge_îd
   */
  removeCharge(charge_id) {
    axios
      .delete('http://localhost:3000/charges/' + charge_id)
      .then(response => {
        if (response.status === 204) {
          let charges = this.state.charges.filter(e => {
            return e._id !== charge_id;
          });

          this.setState({ charges: charges });
        }
      });
  }
  /**
   * Update a charge using the object returned from the form
   * @param {Object} charge
   */
  updateCharge(charge) {
    axios
      .put('http://localhost:3000/charges/' + charge._id, charge)
      .then(response => {
        if (response.status === 200) {
          let charges = this.state.charges.map(e => {
            if (e._id === charge._id) {
              return charge;
            } else {
              return e;
            }
          });

          this.setState({
            charges: charges
          });
        }
      });

    return true;
  }
  /**
   * Switch form to update
   */
  type_update(charge_id) {
    this.setState({
      form_type: 'update',
      selected_charge: charge_id
    });
  }
  /**
   * Swith form to insert
   */
  type_insert() {
    this.setState({
      form_type: 'insert',
      selected_charge: null
    });
  }

  render() {
    let Charges = (
      <tr>
        <td colSpan="5" className="center-align">
          Aucun Charges ajouté
        </td>
      </tr>
    );
    let start =
      this.state.pagination.page === 1
        ? this.state.pagination.start
        : (this.state.pagination.page - 1) * this.state.pagination.size;
    
    let list = this.state.charges.slice(
      start,
      start + this.state.pagination.size
    );
    
    let pagination_buttons;
    if (list.length) {
      
      Charges = list.map(charge => {
        return (
          <Charge
            onClick={this.onSelectCharge}
            charge={charge}
            key={charge._id}
            removeCharge={this.removeCharge}
            updateCharge={this.updateCharge}
            type_update={this.type_update}
          />
        );
      });
      console.log(this.state.pagination.pages);
      pagination_buttons = Array.apply(
        0,
        Array(this.state.pagination.pages)
      ).map((e, i) => (
        <button
          className={this.state.pagination.page === i + 1 ? 'btn teal' : 'btn'}
          key={i + 1}
          onClick={this.selectPage.bind(this, i + 1)}
        >
          {i + 1}
        </button>
      ));
    }

    let modal = this.state.isSelected ? (
      <ChargesModal
        payload={this.state.payload}
        refresh_list={this.refreshList}
        onCloseModal={this.onCloseModal}
      />
    ) : (
      ''
    );
    /**
     * if a charge is selected for update, send it
     */

    let selected_charge = list.filter(e => {
      return e._id === this.state.selected_charge;
    });

    let form = (
      <ChargeForm
        insertCharge={this.insertCharge}
        updateCharge={this.updateCharge}
        type={this.state.form_type}
        type_insert={this.type_insert}
        selected_charge={selected_charge}
      />
    );

    return (
      <div className="main-container">
        <h3 className="title">Charges</h3>
        <div className="row">
          <div className="col s4">
            <div className="card">
              <div className="card-content white-text">{form}</div>
            </div>
          </div>

          <div className="col s8">
            <h4>Liste des Charges</h4>
            <table className="responsive-table ">
              <thead>
                <tr>
                  <th>Charges</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{Charges}</tbody>
              <tfoot>
                <tr>
                  <td colSpan="6">
                    <div className="col s2">
                      <button
                        className={
                          this.state.pagination.page !== 1
                            ? 'btn'
                            : 'btn disabled'
                        }
                        onClick={this.lastPage}
                      >
                        Précédent
                      </button>
                    </div>
                    <div className="col s8 center-align">
                      {pagination_buttons}
                    </div>
                    <div className="col s2">
                      <button
                        className={
                          this.state.pagination.pages !==
                          this.state.pagination.page
                            ? 'btn'
                            : 'btn disabled'
                        }
                        onClick={this.nextPage}
                      >
                        Suivant
                      </button>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div id="modal1" className="modal">
          {modal}
        </div>
      </div>
    );
  }
}
export default Charges;
