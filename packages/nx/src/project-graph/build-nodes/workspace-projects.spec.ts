import { ProjectGraphProjectNode } from '../../config/project-graph';
import { normalizeImplicitDependencies } from './workspace-projects';

describe('workspace-projects', () => {
  let projectGraph: Record<string, ProjectGraphProjectNode> = {
    'test-project': {
      name: 'test-project',
      type: 'lib',
      data: {
        root: 'lib/test-project',
        files: [],
        tags: ['api', 'theme1'],
      },
    },
    a: {
      name: 'a',
      type: 'lib',
      data: {
        root: 'lib/a',
        files: [],
        tags: ['api', 'theme2'],
      },
    },
    b: {
      name: 'b',
      type: 'lib',
      data: {
        root: 'lib/b',
        files: [],
        tags: ['ui'],
      },
    },
    c: {
      name: 'c',
      type: 'lib',
      data: {
        root: 'lib/c',
        files: [],
        tags: ['api'],
      },
    },
  };

  describe('normalizeImplicitDependencies', () => {
    it('should expand "*" implicit dependencies', () => {
      expect(
        normalizeImplicitDependencies('test-project', ['*'], projectGraph)
      ).toEqual(['a', 'b', 'c']);
    });

    it('should return [] for null implicit dependencies', () => {
      expect(
        normalizeImplicitDependencies('test-project', null, projectGraph)
      ).toEqual([]);
    });

    it('should expand glob based implicit dependencies', () => {
      const projectGraphMod: typeof projectGraph = {
        ...projectGraph,
        'b-1': {
          name: 'b-1',
          type: 'lib',
          data: {
            root: 'lib/b-1',
            files: [],
            tags: [],
          },
        },
        'b-2': {
          name: 'b-2',
          type: 'lib',
          data: {
            root: 'lib/b-2',
            files: [],
            tags: [],
          },
        },
      };
      expect(
        normalizeImplicitDependencies('test-project', ['b*'], projectGraphMod)
      ).toEqual(['b', 'b-1', 'b-2']);
    });
  });
});
