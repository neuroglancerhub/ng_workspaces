import { DvidManager } from './DvidManager';

it('computes a DVID server, node and instance from a URL', () => {
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/dde34'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/dde34/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/dde34/segmentation'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/dde34/segmentation/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);

  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/dde34/neighborhood-masks'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'neighborhood-masks']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/dde34/neighborhood-masks/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'neighborhood-masks']);

  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/#/repo/dde34'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/#/repo/dde34/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/api/node/dde34'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/api/node/dde34/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/api/node/dde34/segmentation'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/api/node/dde34/segmentation/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);

  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/api/node/dde34/neighborhood-masks'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'neighborhood-masks']);
  expect(DvidManager.serverNodeInstance('https://hemibrain-dvid2.janelia.org/api/node/dde34/neighborhood-masks/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'neighborhood-masks']);
});

it('computes a DVID server, node and instance from a Neuroglancer source URL', () => {
  expect(DvidManager.serverNodeInstance('dvid://https://hemibrain-dvid2.janelia.org/dde34/segmentation'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);
  expect(DvidManager.serverNodeInstance('dvid://https://hemibrain-dvid2.janelia.org/dde34/segmentation/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'segmentation']);

  expect(DvidManager.serverNodeInstance('dvid://https://hemibrain-dvid2.janelia.org/dde34/neighborhood-masks'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'neighborhood-masks']);
  expect(DvidManager.serverNodeInstance('dvid://https://hemibrain-dvid2.janelia.org/dde34/neighborhood-masks/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34', 'neighborhood-masks']);

  expect(DvidManager.serverNodeInstance('precomputed://gs://neuroglancer-janelia-flyem-hemibrain/v1.0/segmentation'))
    .toEqual(['gs://neuroglancer-janelia-flyem-hemibrain', 'v1.0', 'segmentation']);
  expect(DvidManager.serverNodeInstance('precomputed://gs://neuroglancer-janelia-flyem-hemibrain/v1.0/segmentation/'))
    .toEqual(['gs://neuroglancer-janelia-flyem-hemibrain', 'v1.0', 'segmentation']);
});
