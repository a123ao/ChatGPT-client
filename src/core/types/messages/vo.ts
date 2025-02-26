import type { 
    BaseMessageMeta, 
    SystemMessageMeta, 
    UserMessageMeta, 
    AssistantMessageMeta, 
    MemoryMessageMeta 
} from './meta.ts';

export interface BaseMessageDetailVO {
    id:         string;
    message:    BaseMessageMeta; // some message do not have `message` key
    parent:     string;
    children:   string[];
}

export interface SystemMessageDetailVO extends BaseMessageDetailVO {
    message: SystemMessageMeta
}

export interface UserMessageDetailVO extends BaseMessageDetailVO {
    message: UserMessageMeta;
}

export interface AssistantMessageDetailVO extends BaseMessageDetailVO {
    message: AssistantMessageMeta;
}

export interface InstructionMessageDetailVO extends BaseMessageDetailVO {
    message: SystemMessageMeta;
}

export interface MemoryMessageDetailVO extends BaseMessageDetailVO {
    message: MemoryMessageMeta;
}
