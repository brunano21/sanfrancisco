class DataService {
    /** @ngInject */
  constructor($resource) {
    this._$resource = $resource;
    this.baseUrl = 'http://webservices.nextbus.com/service/publicJSONFeed?';
    this.staticJSONUrl = '../app/maps/';
    this.agency = 'sf-muni';
    this.lastUpdateTimestamp = 0;
    this.prevPositions = [];
  }

  getStaticJson(file) {
    return this._$resource(`${this.staticJSONUrl}${file}.json`).get().$promise;
  }

  getRoutes() {
    return this._$resource(this.baseUrl, {
      command: 'routeConfig',
      a: this.agency
    }).get().$promise.then(data => data.route);
  }

  getVehiclesPositions(routeTag) {
    const params = {
      command: 'vehicleLocations',
      a: this.agency,
      t: this.lastUpdateTimestamp
    };
    if (routeTag) {
      params.r = routeTag;
    }
    return this._$resource(this.baseUrl, params).get().$promise.then(data => {
      this.lastUpdateTimestamp = data.lastTime.time;
      data.vehicle.forEach(v => {
        this.prevPositions[v.id] = v;
      });
      return Object.values(this.prevPositions);
    });
  }

  static dataFactory($resource) {
    return new DataService($resource);
  }

}

DataService.dataFactory.$inject = ['$resource'];

angular
  .module('app')
  .factory('dataService', DataService.dataFactory);
