import { ProjectsConfigurations } from '../config/workspace-json-project-json';
import { NxJsonConfiguration } from '../config/nx-json';
import { findMatchingProjects } from './find-matching-projects';
import { output } from './output';
import { ProjectGraphProjectNode } from '../config/project-graph';

export function assertWorkspaceValidity(
  projectsConfigurations: ProjectsConfigurations,
  nxJson: NxJsonConfiguration
) {
  const projectNames = Object.keys(projectsConfigurations.projects);
  const projectGraphNodes = projectNames.reduce((graph, project) => {
    const projectConfiguration = projectsConfigurations.projects[project];
    graph[project] = {
      name: project,
      type: projectConfiguration.projectType === 'library' ? 'lib' : 'app', // missing fallback to `e2e`
      data: {
        ...projectConfiguration,
        files: [], // missing files
      },
    };
    return graph;
  }, {} as Record<string, ProjectGraphProjectNode>);

  const projects = {
    ...projectsConfigurations.projects,
  };

  const invalidImplicitDependencies = new Map<string, string[]>();

  if (nxJson.implicitDependencies) {
    output.warn({
      title:
        'Using `implicitDependencies` for global implicit dependencies configuration is no longer supported.',
      bodyLines: [
        'Use "namedInputs" instead. You can run "nx repair" to automatically migrate your configuration.',
        'For more information about the usage of "namedInputs" see https://nx.dev/deprecated/global-implicit-dependencies#global-implicit-dependencies',
      ],
    });
  }

  projectNames
    .filter((projectName) => {
      const project = projects[projectName];
      return !!project.implicitDependencies;
    })
    .reduce((map, projectName) => {
      const project = projects[projectName];
      detectAndSetInvalidProjectGlobValues(
        map,
        projectName,
        project.implicitDependencies,
        projects,
        projectGraphNodes
      );
      return map;
    }, invalidImplicitDependencies);

  if (invalidImplicitDependencies.size === 0) {
    return;
  }

  let message = `The following implicitDependencies point to non-existent project(s):\n`;
  message += [...invalidImplicitDependencies.keys()]
    .map((key) => {
      const projectNames = invalidImplicitDependencies.get(key);
      return `  ${key}\n${projectNames
        .map((projectName) => `    ${projectName}`)
        .join('\n')}`;
    })
    .join('\n\n');
  throw new Error(`Configuration Error\n${message}`);
}

function detectAndSetInvalidProjectGlobValues(
  map: Map<string, string[]>,
  sourceName: string,
  desiredImplicitDeps: string[],
  projectConfigurations: ProjectsConfigurations['projects'],
  projects: Record<string, ProjectGraphProjectNode>
) {
  const invalidProjectsOrGlobs = desiredImplicitDeps.filter((implicit) => {
    const projectName = implicit.startsWith('!')
      ? implicit.substring(1)
      : implicit;

    return !(
      projectConfigurations[projectName] ||
      findMatchingProjects([implicit], projects).length
    );
  });

  if (invalidProjectsOrGlobs.length > 0) {
    map.set(sourceName, invalidProjectsOrGlobs);
  }
}
