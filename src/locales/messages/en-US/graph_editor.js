module.exports = {
  title: "Graph Editor",
  ui: {
    parameters: "Parameters",
    select_algorithm: "Select an algorithm",
    select_code_type: "Select a code type",
    start: "Start",
    restart: "Restart",
    no_algorithm: "No algorithm",
    no_codetype: "No code type",
    check_parameters: "Check parameters",
    autorun: "Auto run",
    pause: "Pause",
    previous_step: "Previous",
    next_step: "Next",
    runner_stop: "Ready",
    runner_running: "Running",
    runner_done: "Done",
    step: " step(s)",
    input_panel: "Input",
    algorithm_control: "Controller",
    extra_data: "Extra data",
    code_display: "Code",
    graph_display: "Graph"
  },
  graph: {
    random: {
      name: "RandGraph"
    },
    edge_list: {
      name: "EdgeList"
    },
    adjmat: {
      name: "AdjMat",
      error: {
        non_square: "Not square",
        asymmetric: "Not asymmetric",
        multiple_edges: "Multiple edges not allowed"
      }
    },
    adjlist: {
      name: "AdjList"
    },
    bipartite: {
      name: "BiGraph",
      error: {
        not_bipartite: "Not bipartite"
      }
    },
    bipmat: {
      name: "BiMat",
      error: {
        multiple_edges: "Multiple edges not allowed"
      }
    },
    incmat: {
      name: "IncMat",
      error: {
        non_matrix: "Not a matrix",
        invalid_edge_directed: "Invalid edge(s) (1 & -1 should appear exactly ONCE each column)",
        invalid_edge_undirected: "Invalid edge(s) (1 should appear exactly TWICE each column)"
      }
    },
    fwd_list: {
      name: "FwdList"
    },
    network: {
      name: "FlowGraph",
      error: {
        non_matrix: "Not a matrix"
      }
    }
  },
  input: {
    error: {
      nan: "Not a Number",
      not_an_integer: "Not an Integer",
      zero_or_one: "Only 0 & 1 allowed",
      out_of_range: "Out of Range",
      invalid_row_count: "Invalid row count",
      non_matrix: "Not a matrix"
    },
    props: {
      node_count: "Node count",
      edge_count: "Edge count",
      max_weight: "Max weight",
      directed: "Directed?",
      weighted: "Weighted?",
      self_loop: "Allow-self-loop?",
      multiple_edges: "Allow-multiple-edges?",
      have_cost: "Have-cost?"
    }
  },
  algo: {
    BFS: {
      name: "Graph Traversal: BFS",
      para: {
        start_point: "Start point"
      }
    },
    DFS: {
      name: "Graph Traversal: DFS",
      para: {
        start_point: "Start point"
      }
    },
    CriticalPath: {
      name: "Critical Path",
      para: {}
    },
    EulerPath: {
      name: "Euler Path",
      para: {}
    },
    HamiltonPath: {
      name: "Hamilton Path",
      para: {}
    },
    Kruskal: {
      name: "Minimum Spanning Tree: Kruskal",
      para: {}
    },
    Prim: {
      name: "Minimum Spanning Tree: Prim",
      para: {}
    },
    Dijkstra: {
      name: "Single Source Shortest Path: Dijkstra",
      para: {
        start_point: "Start point"
      }
    },
    Ford: {
      name: "Single Source Shortest Path: Ford",
      para: {
        start_point: "Start point"
      }
    },
    SalesmanProblem: {
      name: "Travelling Salesman Problem: Branch & Bound",
      para: {}
    },
    SalesmanCheaperAlgorithm: {
      name: "Travelling Salesman Problem: Cheaper",
      para: {}
    },
    mf_ff: {
      name: "Maximum Flow: Ford-Fulkerson",
      para: {
        source_vertex: "Source",
        target_vertex: "Target"
      }
    },
    mf_ek: {
      name: "Maximum Flow: Edmonds-Karp",
      para: {
        source_vertex: "Source",
        target_vertex: "Target"
      }
    },
    mf_dinic: {
      name: "Maximum Flow: Dinic",
      para: {
        source_vertex: "Source",
        target_vertex: "Target"
      }
    },
    mcf_classic: {
      name: "Minimum-Cost Maximum Flow: classic",
      para: {
        source_vertex: "Source",
        target_vertex: "Target",
        flow_limit: "Flow limit"
      }
    },
    mcf_zkw: {
      name: "Minimum-Cost Maximum Flow: Zkw",
      para: {
        source_vertex: "Source",
        target_vertex: "Target",
        flow_limit: "Flow limit"
      }
    },
    mbm_hungarian: {
      name: "Bipartite Matching: Hungarian",
      para: {}
    },
    mwbm_km: {
      name: "Weighted Bipartite Matching: Kuhn-Munkres",
      para: {}
    },
    mm_gabow: {
      name: "Matching: Edmonds-Gabow",
      para: {}
    },
    pt_dmp: {
      name: "Planarity Testing: Demoucron-Malgrange-Pertuiset",
      para: {}
    },
    code_type: {
      pseudo: "Pseudocode"
    }
  }
};
