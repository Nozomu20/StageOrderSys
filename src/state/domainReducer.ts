import type { DomainState } from "./domainState";
import type { DomainAction } from "./domainActions";
import { createMember, createPart } from "../domain/roster";
import { createNextTier, createProp } from "../domain/stage";
import { createSegmentsFromBoard } from "../domain/boardCatalog";
import { withoutPlacement } from "../domain/placement";

// 純粋関数として保つこと。副作用・直接mutationは行わない。
// (将来Undo/Redoの履歴管理でこのreducerをラップする前提)
export function domainReducer(
  state: DomainState,
  action: DomainAction,
): DomainState {
  switch (action.type) {
    case "ADD_TIER": {
      const nextTier = createNextTier(state.stage.tiers);
      return {
        ...state,
        stage: { ...state.stage, tiers: [...state.stage.tiers, nextTier] },
      };
    }

    case "REMOVE_TIER": {
      return {
        ...state,
        stage: {
          ...state.stage,
          tiers: state.stage.tiers.filter((t) => t.id !== action.tierId),
        },
      };
    }

    case "MOVE_TIER": {
      const sorted = [...state.stage.tiers].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((t) => t.id === action.tierId);
      const swapWith = action.direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return state;
      const a = sorted[index];
      const b = sorted[swapWith];
      const swappedOrder = a.order;
      const updated = sorted.map((t) => {
        if (t.id === a.id) return { ...t, order: b.order };
        if (t.id === b.id) return { ...t, order: swappedOrder };
        return t;
      });
      return { ...state, stage: { ...state.stage, tiers: updated } };
    }

    case "SET_TIER_BOARD": {
      return {
        ...state,
        stage: {
          ...state.stage,
          tiers: state.stage.tiers.map((t) =>
            t.id === action.tierId
              ? {
                  ...t,
                  segments: createSegmentsFromBoard(action.board, action.count),
                }
              : t,
          ),
        },
      };
    }

    case "SET_TIER_HEIGHT": {
      return {
        ...state,
        stage: {
          ...state.stage,
          tiers: state.stage.tiers.map((t) =>
            t.id === action.tierId
              ? { ...t, height_mm: action.height_mm }
              : t,
          ),
        },
      };
    }

    case "ADD_PART": {
      const order = state.roster.parts.length;
      const part = createPart(action.name, action.color, order);
      return {
        ...state,
        roster: { ...state.roster, parts: [...state.roster.parts, part] },
      };
    }

    case "UPDATE_PART": {
      return {
        ...state,
        roster: {
          ...state.roster,
          parts: state.roster.parts.map((p) =>
            p.id === action.partId ? { ...p, ...action.patch } : p,
          ),
        },
      };
    }

    case "REMOVE_PART": {
      return {
        ...state,
        roster: {
          ...state.roster,
          parts: state.roster.parts.filter((p) => p.id !== action.partId),
        },
      };
    }

    case "ADD_MEMBERS_BULK": {
      const newMembers = action.names.map((n) =>
        createMember(n.familyName, n.givenName, action.partId),
      );
      return {
        ...state,
        roster: {
          ...state.roster,
          members: [...state.roster.members, ...newMembers],
        },
      };
    }

    case "ADD_MEMBER": {
      const member = createMember(
        action.familyName,
        action.givenName,
        action.partId,
      );
      return {
        ...state,
        roster: { ...state.roster, members: [...state.roster.members, member] },
      };
    }

    case "UPDATE_MEMBER": {
      return {
        ...state,
        roster: {
          ...state.roster,
          members: state.roster.members.map((m) =>
            m.id === action.memberId ? { ...m, ...action.patch } : m,
          ),
        },
      };
    }

    case "REMOVE_MEMBER": {
      return {
        ...state,
        roster: {
          ...state.roster,
          members: state.roster.members.filter(
            (m) => m.id !== action.memberId,
          ),
        },
        placements: withoutPlacement(state.placements, action.memberId),
      };
    }

    case "PLACE_MEMBER": {
      return {
        ...state,
        placements: {
          ...state.placements,
          [action.memberId]: {
            memberId: action.memberId,
            x_mm: action.x_mm,
            y_mm: action.y_mm,
          },
        },
      };
    }

    case "UNPLACE_MEMBER": {
      return {
        ...state,
        placements: withoutPlacement(state.placements, action.memberId),
      };
    }

    case "UPDATE_SETTINGS": {
      return { ...state, settings: { ...state.settings, ...action.patch } };
    }

    case "UPDATE_OUTPUT_INFO": {
      return {
        ...state,
        outputInfo: { ...state.outputInfo, ...action.patch },
      };
    }

    case "ADD_PROP": {
      const prop = createProp(action.propType);
      return {
        ...state,
        stage: { ...state.stage, props: [...state.stage.props, prop] },
      };
    }

    case "MOVE_PROP": {
      return {
        ...state,
        stage: {
          ...state.stage,
          props: state.stage.props.map((p) =>
            p.id === action.propId
              ? { ...p, x_mm: action.x_mm, y_mm: action.y_mm }
              : p,
          ),
        },
      };
    }

    case "ROTATE_PROP": {
      return {
        ...state,
        stage: {
          ...state.stage,
          props: state.stage.props.map((p) =>
            p.id === action.propId
              ? { ...p, angle_deg: (p.angle_deg + action.deltaDeg + 360) % 360 }
              : p,
          ),
        },
      };
    }

    case "REMOVE_PROP": {
      return {
        ...state,
        stage: {
          ...state.stage,
          props: state.stage.props.filter((p) => p.id !== action.propId),
        },
      };
    }

    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}
