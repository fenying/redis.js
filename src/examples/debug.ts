/**
 * Copyright 2021 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Redis from '../lib';

function sleep(ms: number): Promise<void> {

    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

(async () => {

    const cli = Redis.createCommandClient({});
    const sub = Redis.createSubscriberClient({});

    await sub.connect();

    // await sub.auth("hello");

    sub.on('message', function(c, d): void {

        console.log(`Channel: ${c}, Data: ${d.toString()}`);
    });

    await sub.subscribe(['hello']);

    await cli.connect();
    // await cli.auth("hello");
    await cli.flushAll();

    console.log('PING ->', await cli.ping(''));
    console.log('GET ->', await cli.set('a', '123'));
    console.log('INCR ->', await cli.incr('a', 23));
    console.log('INCRBYFLOAT ->', await cli.incrByFloat('a', 23.4));
    console.log('GET ->', await cli.get('a'));
    console.log('MGET ->', await cli.mGet(['a', 'sada']));
    console.log('MGET ->', await cli.mGet(['a', 'sada']));

    const SHA1 = await cli.scriptLoad('return redis.call("GET", "a")');

    console.log('EVAL ->', (await cli.evalSHA(SHA1, [], [])).toString());

    await sleep(2000);

    let x = cli.set('a', '333');

    console.log('SET ->', await x);
    console.log('LPUSH ->', await cli.lPush('lll', ['a', 'b']));
    console.log('LINDEX ->', await cli.lIndex('lll', 1));
    console.log('LRANGE ->', await cli.lRange('lll', 0, -1));
    console.log('HMSET->', await cli.hMSet('ggg', {
        'a': '3333',
        'bb': '1231232131'
    }));
    console.log('HMGET->', await cli.hMGet('ggg', ['bb', 'a']));
    console.log('INCR->', await cli.incr('a'));
    console.log('PUBSUBCHANNELS->', await cli.pubSubChannels());
    console.log('PUBSUBNUMPAT->', await cli.pubSubNumPat());
    console.log('PUBSUBNUMSUB->', await cli.pubSubNumSub(['hello']));
    console.log('PUBLISH->', await cli.publish('hello', 'test'));
    console.log('EXISTS->', await cli.exists('a'));
    console.log('MEXISTS->', await cli.mExists(['a', 'b', 'lll', 'x', 'y']));

    await sleep(2000);

    const pipeline = await cli.multi();

    // Multi Mode
    await pipeline.multi();
    await pipeline.get('a');

    await pipeline.set('ccc', 'g');

    await pipeline.mGet(['a', 'ccc']);

    await pipeline.hSet('h', 'name', 'Mick');
    await pipeline.hMSet('h', {
        'age': 123,
        'title': 'Mr.'
    });

    await pipeline.hMGet('h', ['age', 'title']);
    await pipeline.hGetAll('h');
    console.log(JSON.stringify(await pipeline.scan(0), null, 2));

    await pipeline.incr('a', 123);

    await pipeline.command('HGETALL', ['h']);

    console.log(JSON.stringify(await pipeline.exec(), null, 2));

    // Pipeline Mode
    await pipeline.get('a');

    await pipeline.set('ccc', 'g');

    await pipeline.mGet(['a', 'ccc']);

    await pipeline.hSet('h', 'name', 'Mick');
    await pipeline.hMSet('h', {
        'age': 123,
        'title': 'Mr.'
    });

    await pipeline.hMGet('h', ['age', 'title']);
    await pipeline.hGetAll('h');
    console.log(JSON.stringify(await pipeline.scan(0), null, 2));

    await pipeline.incr('a', 123);

    await pipeline.command('HGETALL', ['h']);

    console.log(JSON.stringify(await pipeline.exec(), null, 2));

    await pipeline.close();

    await cli.close();
    await sub.close();

})().catch((e) => console.error(e));
