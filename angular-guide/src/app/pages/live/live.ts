import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type RedisChannel = 'ecomm:orders' | 'ecomm:inventory' | 'ecomm:presence';

export interface RedisMessage {
  id: string;
  channel: RedisChannel;
  publisherId: string;
  publisherName: string;
  timestamp: Date;
  payload: Record<string, any>;
  latencyMs: number;
}

export interface SubscriberClient {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  subscribedChannels: Set<RedisChannel>;
  receivedMessages: RedisMessage[];
  unreadCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'PUB' | 'SUB' | 'REDIS' | 'INFO';
  channel?: RedisChannel;
  text: string;
  rawPayload?: string;
}

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live.html',
  styleUrl: './live.css',
})
export class Live implements OnInit, OnDestroy {
  // Available Channels
  readonly availableChannels: { id: RedisChannel; name: string; description: string; badgeColor: string }[] = [
    {
      id: 'ecomm:orders',
      name: 'ecomm:orders',
      description: 'Dispatched when new customer orders are confirmed',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'ecomm:inventory',
      name: 'ecomm:inventory',
      description: 'Dispatched when SKU stock levels or flash discounts update',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'ecomm:presence',
      name: 'ecomm:presence',
      description: 'Dispatched when active shoppers or admins view or lock items',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  // 3 Publishers
  publishers = [
    { id: 'pub-storefront', name: 'Storefront Checkout API', role: 'Client Gateway', icon: '🛒' },
    { id: 'pub-inventory', name: 'ERP Stock Controller', role: 'Backend Worker', icon: '📦' },
    { id: 'pub-session', name: 'User Presence Tracker', role: 'WebSocket Sidecar', icon: '👥' }
  ];
  selectedPublisherId = 'pub-storefront';

  // 3 Subscribers (Multi-sub)
  subscribers: SubscriberClient[] = [
    {
      id: 'sub-warehouse',
      name: 'Warehouse Ops Console',
      role: 'Fulfillment & Logistics',
      avatarColor: 'bg-amber-600',
      subscribedChannels: new Set<RedisChannel>(['ecomm:orders', 'ecomm:inventory']),
      receivedMessages: [],
      unreadCount: 0
    },
    {
      id: 'sub-storefront',
      name: 'Customer Web App',
      role: 'Shopper Realtime Client',
      avatarColor: 'bg-blue-600',
      subscribedChannels: new Set<RedisChannel>(['ecomm:inventory', 'ecomm:presence']),
      receivedMessages: [],
      unreadCount: 0
    },
    {
      id: 'sub-analytics',
      name: 'Executive Analytics Hub',
      role: 'Live Revenue & Audit',
      avatarColor: 'bg-indigo-600',
      subscribedChannels: new Set<RedisChannel>(['ecomm:orders', 'ecomm:presence']),
      receivedMessages: [],
      unreadCount: 0
    }
  ];

  // Selected Channel for Manual Publish
  selectedPublishChannel: RedisChannel = 'ecomm:orders';
  customPayloadJson = '{\n  "orderId": "ORD-9841",\n  "customer": "Rohan Tandel",\n  "amount": 4250.00,\n  "currency": "INR",\n  "items": 3\n}';

  // Metrics
  totalPublished = 0;
  totalDelivered = 0;
  avgLatencyMs = 3.2;
  redisServerStatus: 'CONNECTED' | 'RECONNECTING' = 'CONNECTED';
  redisEndpoint = 'docker_redis:6379';

  // Live Packet Animation State
  activeTransmission = false;
  lastTransmittedChannel = '';

  // Terminal & Activity Logs
  logs: LogEntry[] = [];
  logFilter: 'ALL' | RedisChannel = 'ALL';
  isAutoScroll = true;

  // Auto Traffic Simulator
  isTrafficSimulationActive = false;
  private simulationIntervalId?: any;

  // Aggregated Business State derived from live messages
  liveBusinessState = {
    totalRevenueInr: 124800,
    totalOrdersCount: 42,
    latestOrder: { id: 'ORD-9840', customer: 'Sarah Jenkins', amount: 3200, time: '19:25' },
    macbookStock: 18,
    flashSaleActive: false,
    activeViewersCount: 6,
    currentlyEditingUser: 'Alex Morgan'
  };

  ngOnInit() {
    this.addLog('INFO', undefined, 'Connected to Redis broker at docker_redis:6379 (protocol RESP3, DB: 0)');
    this.addLog('INFO', undefined, 'Initialized 3 subscriber clients with dynamic channel subscriptions');
  }

  ngOnDestroy() {
    this.stopTrafficSimulation();
  }

  // --- Interaction 1: Publish New Order ---
  publishSampleOrder() {
    const randomOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const customers = ['Rohan Tandel', 'Priya Sharma', 'Alex Lee', 'David Kim', 'Elena Rostova'];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const amounts = [1250, 3499, 8900, 15999, 24500];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const items = Math.floor(1 + Math.random() * 5);

    const payload = {
      orderId: randomOrderId,
      customer,
      amount,
      currency: 'INR',
      itemsCount: items,
      paymentMethod: 'UPI_INSTANT',
      status: 'CONFIRMED'
    };

    this.executePublish('ecomm:orders', 'pub-storefront', payload);
  }

  // --- Interaction 2: Publish Inventory / Price Surge ---
  publishSampleInventory() {
    const deltaStock = Math.max(1, this.liveBusinessState.macbookStock - 1);
    const flashDiscounts = [10, 15, 20, 25];
    const discount = flashDiscounts[Math.floor(Math.random() * flashDiscounts.length)];
    const isFlash = Math.random() > 0.5;

    const payload = {
      sku: 'SKU-MBP-M3-PRO',
      productName: 'MacBook Pro 14" M3',
      stockRemaining: deltaStock,
      regularPrice: 199900,
      currentPrice: isFlash ? 179900 : 199900,
      flashSaleActive: isFlash,
      discountPercent: isFlash ? discount : 0,
      warehouseCode: 'BOM-FC-01'
    };

    this.executePublish('ecomm:inventory', 'pub-inventory', payload);
  }

  // --- Interaction 3: Publish Presence & Collaboration ---
  publishSamplePresence() {
    const users = ['Jo Patterson', 'Rohan Tandel', 'Taylor Swift', 'Devin Chen', 'Maya Lin'];
    const actions = ['Browsing Checkout', 'Locked Cart Row', 'Viewing Inventory Details', 'Applying Coupon'];
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const payload = {
      userId: `usr_${Math.floor(100 + Math.random() * 900)}`,
      userName: user,
      action,
      sessionId: `sess_${Date.now().toString(36)}`,
      resourceId: 'cart_session_global',
      device: 'Chrome / macOS'
    };

    this.executePublish('ecomm:presence', 'pub-session', payload);
  }

  // --- Manual Publish with Payload Textarea ---
  publishCustomPayload() {
    try {
      const parsed = JSON.parse(this.customPayloadJson);
      this.executePublish(this.selectedPublishChannel, this.selectedPublisherId, parsed);
    } catch (err: any) {
      alert(`Invalid JSON payload: ${err.message}`);
    }
  }

  // Core Publish Execution (Simulates Network -> Backend -> Redis Pub/Sub -> Subscribers)
  private executePublish(channel: RedisChannel, publisherId: string, payload: Record<string, any>) {
    const publisher = this.publishers.find(p => p.id === publisherId) || this.publishers[0];
    const latency = parseFloat((2 + Math.random() * 4).toFixed(1)); // 2.0ms - 6.0ms realistic broker latency

    const message: RedisMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channel,
      publisherId: publisher.id,
      publisherName: publisher.name,
      timestamp: new Date(),
      payload,
      latencyMs: latency
    };

    this.totalPublished++;
    this.avgLatencyMs = parseFloat(((this.avgLatencyMs * 0.8) + (latency * 0.2)).toFixed(1));

    // Trigger visual packet animation
    this.activeTransmission = true;
    this.lastTransmittedChannel = channel;
    setTimeout(() => this.activeTransmission = false, 600);

    // 1. Log PUB command
    this.addLog('PUB', channel, `PUBLISH ${channel} (payload size: ${JSON.stringify(payload).length} bytes)`, JSON.stringify(payload));

    // 2. Broadcast to subscribed clients
    let deliveredCount = 0;
    this.subscribers.forEach(sub => {
      if (sub.subscribedChannels.has(channel)) {
        deliveredCount++;
        sub.receivedMessages.unshift(message);
        sub.unreadCount++;

        // Keep local message history manageable
        if (sub.receivedMessages.length > 25) {
          sub.receivedMessages.pop();
        }

        this.addLog('SUB', channel, `[${sub.name}] received event on ${channel} (broker latency: ${latency}ms)`);
      }
    });

    this.totalDelivered += deliveredCount;

    // 3. Log REDIS Broadcast summary
    this.addLog('REDIS', channel, `REDIS: Broadcasted message to ${deliveredCount} subscriber socket(s) in ${latency}ms`);

    // 4. Update Business View models
    this.updateLiveBusinessState(channel, payload);
  }

  private updateLiveBusinessState(channel: RedisChannel, payload: Record<string, any>) {
    if (channel === 'ecomm:orders') {
      if (payload['amount']) {
        this.liveBusinessState.totalRevenueInr += Number(payload['amount']);
        this.liveBusinessState.totalOrdersCount++;
      }
      if (payload['orderId']) {
        this.liveBusinessState.latestOrder = {
          id: payload['orderId'],
          customer: payload['customer'] || 'Customer',
          amount: payload['amount'] || 0,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }
    } else if (channel === 'ecomm:inventory') {
      if (payload['stockRemaining'] !== undefined) {
        this.liveBusinessState.macbookStock = payload['stockRemaining'];
      }
      if (payload['flashSaleActive'] !== undefined) {
        this.liveBusinessState.flashSaleActive = payload['flashSaleActive'];
      }
    } else if (channel === 'ecomm:presence') {
      if (payload['userName']) {
        this.liveBusinessState.currentlyEditingUser = payload['userName'];
      }
      this.liveBusinessState.activeViewersCount = Math.floor(4 + Math.random() * 5);
    }
  }

  // Subscriber Controls
  toggleSubscription(sub: SubscriberClient, channel: RedisChannel) {
    if (sub.subscribedChannels.has(channel)) {
      sub.subscribedChannels.delete(channel);
      this.addLog('INFO', channel, `[${sub.name}] UNSUBSCRIBE ${channel}`);
    } else {
      sub.subscribedChannels.add(channel);
      this.addLog('INFO', channel, `[${sub.name}] SUBSCRIBE ${channel}`);
    }
  }

  isSubscribed(sub: SubscriberClient, channel: RedisChannel): boolean {
    return sub.subscribedChannels.has(channel);
  }

  clearSubscriberMessages(sub: SubscriberClient) {
    sub.receivedMessages = [];
    sub.unreadCount = 0;
  }

  // Traffic Simulation Loop
  toggleTrafficSimulation() {
    if (this.isTrafficSimulationActive) {
      this.stopTrafficSimulation();
    } else {
      this.startTrafficSimulation();
    }
  }

  private startTrafficSimulation() {
    this.isTrafficSimulationActive = true;
    this.addLog('INFO', undefined, 'Auto-traffic generator STARTED (publishing event every 3.2s)');

    // Fire one immediately
    this.publishRandomEvent();

    this.simulationIntervalId = setInterval(() => {
      this.publishRandomEvent();
    }, 3200);
  }

  private stopTrafficSimulation() {
    this.isTrafficSimulationActive = false;
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = undefined;
      this.addLog('INFO', undefined, 'Auto-traffic generator STOPPED');
    }
  }

  private publishRandomEvent() {
    const roll = Math.random();
    if (roll < 0.4) {
      this.publishSampleOrder();
    } else if (roll < 0.7) {
      this.publishSampleInventory();
    } else {
      this.publishSamplePresence();
    }
  }

  // Logs & Console helpers
  private addLog(type: LogEntry['type'], channel: RedisChannel | undefined, text: string, rawPayload?: string) {
    this.logs.unshift({
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      type,
      channel,
      text,
      rawPayload
    });

    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  clearLogs() {
    this.logs = [];
    this.addLog('INFO', undefined, 'Logs cleared by user.');
  }

  get filteredLogs(): LogEntry[] {
    if (this.logFilter === 'ALL') return this.logs;
    return this.logs.filter(l => !l.channel || l.channel === this.logFilter);
  }

  selectPreset(preset: 'order' | 'inventory' | 'presence') {
    if (preset === 'order') {
      this.selectedPublishChannel = 'ecomm:orders';
      this.selectedPublisherId = 'pub-storefront';
      this.customPayloadJson = JSON.stringify({
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: 'Rohan Tandel',
        amount: 4999.00,
        currency: 'INR',
        items: 2,
        paymentStatus: 'PAID'
      }, null, 2);
    } else if (preset === 'inventory') {
      this.selectedPublishChannel = 'ecomm:inventory';
      this.selectedPublisherId = 'pub-inventory';
      this.customPayloadJson = JSON.stringify({
        sku: 'SKU-MBP-M3-PRO',
        stockRemaining: Math.max(1, this.liveBusinessState.macbookStock - 1),
        currentPrice: 179900,
        flashSaleActive: true,
        discountPercent: 15
      }, null, 2);
    } else if (preset === 'presence') {
      this.selectedPublishChannel = 'ecomm:presence';
      this.selectedPublisherId = 'pub-session';
      this.customPayloadJson = JSON.stringify({
        userId: 'usr_8412',
        userName: 'Jo Patterson',
        action: 'Editing Customer Record',
        resourceId: 'user_row_12',
        status: 'ACTIVE'
      }, null, 2);
    }
  }
}
