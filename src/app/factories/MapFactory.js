class Map {
  /** @ngInject */
  constructor(dataService, $window, $document) {
    this._map = null;
    this._dataService = dataService;
    this._$window = $window;
    this._$document = $document;
    this.mapContainerClass = 'main-container';
    this.init();
  }

  static mapFactory(dataService, $window, $document) {
    return new Map(dataService, $window, $document);
  }

  init() {
    const size = this.getWindowSize();
    [this.width, this.height] = [size.w, size.h];

    // ref https://github.com/d3/d3-3.x-api-reference/blob/master/Zoom-Behavior.md#scaleExtent
    this.zoom = d3.behavior.zoom().scaleExtent([-0.15, 7]);

    this._projection = d3.geo.mercator();
    this._projection.scale(308100).center([-122 - this._mapCenter(this.width), 37.78]);

    this.path = d3.geo.path().projection(this._projection);
  }

  loadMap() {
    this._map = d3.select(`.${this.mapContainerClass}`)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(this.zoom.on('zoom', this.redraw)); // redraw the map on zoom in/out, repositioning paths (routes) and circles (buses)

    return Promise.all([
      this._dataService.getStaticJson('arteries').then(arteries => {
        this.draw(arteries, 'arteries', this.path);
      }),
      this._dataService.getStaticJson('freeways').then(freeways => {
        this.draw(freeways, 'freeways', this.path);
      }),
      this._dataService.getStaticJson('neighborhoods').then(neighborhoods => {
        this.draw(neighborhoods, 'neighborhoods', this.path);
      }),
      this._dataService.getStaticJson('streets').then(streets => {
        this.draw(streets, 'streets', this.path);
      })
    ]);
  }

  draw(json, className, path) {
    this.getMap().drawOnMap(json, className, path);
  }

  redraw() {
    // Useful ref: https://stackoverflow.com/questions/20230700/d3-redraw-chart-on-zoom-with-the-new-zoomed-in-range
    const trans = d3.event.translate;
    const scale = d3.event.scale;
    d3.selectAll('path, circle').attr('transform', `translate(${trans}) scale(${scale})`);
  }

  getMap() {
    return this._map;
  }

  getProjection() {
    return this._projection;
  }

  getWindowSize() {
    const w = this._$window;
    const d = this._$document;
    const e = d.documentElement;
    const g = d.find('body')[0];
    const x = w.innerWidth || e.clientWidth || g.clientWidth;
    const y = w.innerHeight || e.clientHeight || g.clientHeight;
    return {
      w: x,
      h: y
    };
  }

  _mapCenter(value) {
    const low = [320, 40];
    const high = [1440, 46];
    return (low[1] + (high[1] - low[1]) * (value - low[0]) / (high[0] - low[0])) / 100;
  }
}

Map.mapFactory.$inject = ['dataService', '$window', '$document'];

angular
  .module('app')
  .factory('mapService', Map.mapFactory);

// d3 enhancing
d3.selection.prototype.drawOnMap = function (json, className, path) {
  return this
    .append('path')
    .datum(json) // bypasses the data-join process
    .attr('class', `map ${className}`)
    .style('fill', 'none')
    .attr('d', path);
};
