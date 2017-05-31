class Routes {
  /** @ngInject */
  constructor(dataService, mapService) {
    this._dataService = dataService;
    this._mapService = mapService;
    this.routeClass = 'route';
  }

  static routesFactory(dataService, mapService) {
    return new Routes(dataService, mapService);
  }

  drawRoutes() {
    return this._dataService.getRoutes().then(
      data => {
        data.forEach(route => {
          this.render(route);
        });
      });
  }

  render(route) {
    const line = d3.svg.line()
      .x(function (d) {
        return self._mapService.getProjection()([d.lon, d.lat])[0];
      })
      .y(function (d) {
        return self._mapService.getProjection()([d.lon, d.lat])[1];
      })
      .interpolate('linear');

    route.path.forEach(path => {
      this._mapService.getMap()
        .append('path')
        .attr('d', line(path.point))
        .attr('class', this.routeClass)
        .attr('data-tag', route.tag)
        .attr('stroke', `#${route.color}`)
        .attr('stroke-width', 2)
        .style('stroke-opacity', 0.3)
        .attr('fill', 'none');

      this._mapService.getMap()
        .append('path')
        .attr('d', line(path.point))
        .attr('data-tag', route.tag)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .attr('fill', 'none');
    });
  }

}

Routes.routesFactory.$inject = ['dataService', 'mapService'];

angular
  .module('app')
  .factory('routesService', Routes.routesFactory);
