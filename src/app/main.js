class MainController {
  /** @ngInject */
  constructor($scope, mapService, routesService, vehiclesService, $interval) {
    this._routesService = routesService;
    this._vehiclesService = vehiclesService;
    this._mapService = mapService;
    this._interval = 15000;

    this._mapService.loadMap().then(() => {
      this._routesService.drawRoutes();
      this._vehiclesService.drawVehicles();

      $interval(() => {
        this._vehiclesService.drawVehicles();
      }, this._interval);
    });
  }
}

angular
  .module('app')
  .component('app', {
    templateUrl: 'app/main.html',
    controller: MainController
  });
