import { FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule
} from '@angular/material/tree';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Fruit loops' }]
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{ name: 'Broccoli' }, { name: 'Brussels sprouts' }]
      },
      {
        name: 'Orange',
        children: [{ name: 'Pumpkins' }, { name: 'Carrots' }]
      }
    ]
  }
];

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'sg-tree-story',
  template: `
    <mat-tree
      [ngClass]="{ 'high-dense': highDensityApplied }"
      [dataSource]="dataSource"
      [treeControl]="treeControl"
    >
      <mat-tree-node
        *matTreeNodeDef="let node"
        matTreeNodePadding
        [matTreeNodePaddingIndent]="48"
      >
        {{ node.name }}
      </mat-tree-node>
      <mat-tree-node
        *matTreeNodeDef="let node; when: hasChild"
        matTreeNodePadding
        [matTreeNodePaddingIndent]="48"
      >
        <button mat-icon-button matTreeNodeToggle>
          <mat-icon class="mat-icon-rtl-mirror">
            {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
          </mat-icon>
        </button>
        {{ node.name }}
      </mat-tree-node>
    </mat-tree>
  `
})
class TreeStoryComponent {
  @Input() highDensityApplied: boolean;
  treeControl: FlatTreeControl<ExampleFlatNode>;
  treeFlattener: MatTreeFlattener<any, any>;
  dataSource: MatTreeFlatDataSource<any, any>;

  constructor() {
    this.treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level,
      node => node.expandable
    );
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      node => node.level,
      node => node.expandable,
      node => node.children
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (index: number, node: ExampleFlatNode): boolean => node.expandable;

  private readonly transformer = (node: FoodNode, level: number): {
    expandable: boolean;
    name: string;
    level: number;
  } => ({
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level
    });
}

@NgModule({
  declarations: [TreeStoryComponent],
  imports: [CommonModule, MatTreeModule, MatIconModule, MatButtonModule],
  exports: [TreeStoryComponent]
})
class TreeStoryModule {}

export default {
  title: 'Solargis/Components/Tree',
  decorators: [
    moduleMetadata({
      imports: [TreeStoryModule, SgDefaultsModule]
    })
  ]
};

export const lowDensity: Story = () => ({
  template: `<sg-tree-story></sg-tree-story>`
});

export const highDensity: Story = () => ({
  template: `<sg-tree-story [highDensityApplied]="true"></sg-tree-story>`
});
