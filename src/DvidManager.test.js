import { DvidManager } from './DvidManager';

it('computes a DVID server and node from a segmentation URL', () => {
  expect(DvidManager.serverNode('dvid://https://hemibrain-dvid2.janelia.org/dde34/segmentation'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('dvid://https://hemibrain-dvid2.janelia.org/dde34/segmentation/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
});

it('computes a DVID server and node from a DVID URL', () => {
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/dde34'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/dde34/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/dde34/segmentation'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/dde34/segmentation/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/#/repo/dde34'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/#/repo/dde34/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/api/node/dde34'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/api/node/dde34/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/api/node/dde34/segmentation'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
  expect(DvidManager.serverNode('', 'https://hemibrain-dvid2.janelia.org/api/node/dde34/segmentation/'))
    .toEqual(['https://hemibrain-dvid2.janelia.org', 'dde34']);
});
