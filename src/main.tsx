/**
 * Front-end entry point of the Portal Directory application
 * Mounts the core React layout with Global Error Boundary handlers.
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import './index.css';
import './i18n';

// Safe DOM patch for Google Translate / extension interference to prevent "removeChild" / "insertBefore" crashes
if (typeof window !== 'undefined') {
  const WAS_CONNECTED = '__was_connected';

  // Mark all initial DOM elements as connected
  if (typeof document !== 'undefined') {
    const markConnected = (node: Node) => {
      if (!node) return;
      (node as any)[WAS_CONNECTED] = true;
      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          markConnected(node.childNodes[i]);
        }
      }
    };
    try {
      markConnected(document.documentElement);
    } catch (e) {
      console.warn('DOM patch: failed to mark initial nodes', e);
    }
  }

  // Patch appending methods to mark new nodes as connected
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function <T extends Node>(child: T): T {
    if (child) {
      (child as any)[WAS_CONNECTED] = true;
    }
    return originalAppendChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newChild: T, refChild: Node | null): T {
    if (newChild) {
      (newChild as any)[WAS_CONNECTED] = true;
    }
    if (refChild && refChild.parentNode !== this) {
      if (refChild.parentNode) {
        return originalInsertBefore.call(refChild.parentNode, newChild, refChild) as T;
      }
      return originalInsertBefore.call(this, newChild, null) as T;
    }
    return originalInsertBefore.call(this, newChild, refChild) as T;
  };

  const originalReplaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function <T extends Node>(newChild: Node, oldChild: T): T {
    if (newChild) {
      (newChild as any)[WAS_CONNECTED] = true;
    }
    return originalReplaceChild.call(this, newChild, oldChild) as T;
  };

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (!child) return child;
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return originalRemoveChild.call(child.parentNode, child) as T;
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalParentNodeDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode');
  if (originalParentNodeDescriptor && originalParentNodeDescriptor.get) {
    const originalParentNode = originalParentNodeDescriptor.get;
    
    // Create a dummy element that has safe no-op DOM methods
    const dummyParent = document.createElement('div');
    dummyParent.removeChild = function <T extends Node>(child: T): T { return child; };
    dummyParent.insertBefore = function <T extends Node>(newChild: T, refChild: Node | null): T { return newChild; };
    dummyParent.replaceChild = function <T extends Node>(newChild: Node, oldChild: T): T { return oldChild; };
    
    // Prevent dummyParent itself from returning dummyParent when parentNode is accessed
    (dummyParent as any)[WAS_CONNECTED] = false;

    Object.defineProperty(Node.prototype, 'parentNode', {
      get() {
        const parent = originalParentNode.call(this);
        if (parent === null && this[WAS_CONNECTED] === true && this !== dummyParent) {
          return dummyParent;
        }
        return parent;
      },
      configurable: true
    });
  }
}

// Remove the SSR SEO pre-rendered content off-screen div once React takes over to avoid duplicate content penalty
document.getElementById('seo-prerender')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
