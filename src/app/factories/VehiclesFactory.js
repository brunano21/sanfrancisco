class Vehicles {
  /** @ngInject */
  constructor(dataService, mapService) {
    this._dataService = dataService;
    this._mapService = mapService;
    this.vehicleClass = 'vehicle';
    this.lastUpdateTimestamp = 0;
  }

  drawVehicles() {
    const self = this;
    this._dataService.getVehiclesPositions().then(
      data => {
        this.vehicles = data;
        this._mapService.getMap().selectAll(`.${this.vehicleClass}`).call(function () {
          // selection context
          const v = this.data(data);

          v.enter()
            .append('circle')
            .attr('r', '4px')
            .attr('fill', 'black');

          v.exit()
            .remove();

          v.attr('class', self.vehicleClass)
            .attr('data-route-tag', d => d.routeTag)
            .attr('data-dir-tag', d => d.dirTag)
            .attr('data-heading', d => d.heading)
            .attr('data-id', d => d.id)
            .transition()
            .attr('cx', function (d) {
              return self._mapService.getProjection()([d.lon, d.lat])[0];
            })
            .attr('cy', function (d) {
              return self._mapService.getProjection()([d.lon, d.lat])[1];
            });
          return v;
        });
      });
  }

  static VehiclesFactory(dataService, mapService) {
    return new Vehicles(dataService, mapService);
  }
}

Vehicles.VehiclesFactory.$inject = ['dataService', 'mapService'];

angular
  .module('app')
  .factory('vehiclesService', Vehicles.VehiclesFactory);
