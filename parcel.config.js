import {Packager} from '@parcel/plugin';
import SourceMap from '@parcel/source-map';
import {countLines} from '@parcel/utils';

export default new Packager({
  async package({bundle, options, getSourceMapReference}) {
    let promises = [];
    bundle.traverseAssets(asset => {
      promises.push(Promise.all([
        asset.getCode(),
        asset.getMap()
      ]));
    });

    let assets = await Promise.all(promises);
    let contents = '';
    let map = new SourceMap(options.projectRoot);
    let lineOffset = 0;

    for (let [code, map] of assets) {
      contents += code + '\n';
      map.addSourceMap(map, lineOffset);
      lineOffset += countLines(code) + 1;
    }

    contents += `\n//# sourceMappingURL=${await getSourceMapReference(map)}\n`;
    return {contents, map};
  }
});